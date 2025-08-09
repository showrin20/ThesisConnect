const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const CommunityPostService = require('../services/communityPostService');
const Project = require('../models/Project'); // Added to fetch user projects
const { body, validationResult, query } = require('express-validator');

// Validation middleware
const validateCreatePost = [
  body('type').isIn(['collab', 'general']).withMessage('Type must be either collab or general'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('skillsNeeded').optional().isArray().withMessage('Skills needed must be an array'),
  body('status').optional().isIn(['open', 'closed', 'in-progress']).withMessage('Status must be open, closed, or in-progress'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('projectId').optional().isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId'),
];

const validateUpdatePost = [
  body('type').optional().isIn(['collab', 'general']).withMessage('Type must be either collab or general'),
  body('content').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('skillsNeeded').optional().isArray().withMessage('Skills needed must be an array'),
  body('status').optional().isIn(['open', 'closed', 'in-progress']).withMessage('Status must be open, closed, or in-progress'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('projectId').optional().isMongoId().withMessage('Project ID must be a valid MongoDB ObjectId'),
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['collab', 'general']).withMessage('Type must be either collab or general'),
];

// Error handler for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// CREATE - POST /api/community-posts
router.post('/', auth, validateCreatePost, handleValidationErrors, async (req, res) => {
  try {
    console.log('Create post request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user.id);
    
    const postData = {
      ...req.body,
      postId: req.body.postId || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Optional: Validate projectId ownership here if projectId provided
    if (postData.projectId) {
      const project = await Project.findById(postData.projectId);
      if (!project || project.authorId.toString() !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project selected. You can only link your own projects.'
        });
      }
    }

    const post = await CommunityPostService.createPost(postData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Community post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create community post',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// READ ALL - GET /api/community-posts
router.get('/', validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      type: req.query.type,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };

    const result = await CommunityPostService.getAllPosts(options);

    res.json({
      success: true,
      message: 'Community posts retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve community posts',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// READ USER'S POSTS - GET /api/community-posts/my-posts
router.get('/my-posts', auth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      type: req.query.type
    };

    const result = await CommunityPostService.getUserPosts(req.user.id, options);

    res.json({
      success: true,
      message: 'Your community posts retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your community posts',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// READ ONE - GET /api/community-posts/:postId
router.get('/:postId', async (req, res) => {
  try {
    const post = await CommunityPostService.getPostById(req.params.postId);

    res.json({
      success: true,
      message: 'Community post retrieved successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    const statusCode = error.message === 'Post not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve community post',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// UPDATE - PUT /api/community-posts/:postId
router.put('/:postId', auth, validateUpdatePost, handleValidationErrors, async (req, res) => {
  try {
    const updatedPost = await CommunityPostService.updatePost(
      req.params.postId,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      message: 'Community post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('Update post error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update community post',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE - DELETE /api/community-posts/:postId
router.delete('/:postId', auth, async (req, res) => {
  try {
    const result = await CommunityPostService.deletePost(req.params.postId, req.user.id);

    res.json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    console.error('Delete post error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                      error.message.includes('Unauthorized') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete community post',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ADD REPLY - POST /api/community-posts/:postId/replies
router.post('/:postId/replies', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Reply content must be between 1 and 1000 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const replyData = {
      replyId: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: req.body.content
    };

    const post = await CommunityPostService.addReply(req.params.postId, replyData, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Add reply error:', error);
    const statusCode = error.message === 'Post not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add reply',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// TOGGLE LIKE - POST /api/community-posts/:postId/like
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await CommunityPostService.toggleLike(req.params.postId, req.user.id);

    res.json({
      success: true,
      message: 'Post like updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    const statusCode = error.message === 'Post not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update post like',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// NEW ROUTE: GET /api/community-posts/my-projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ authorId: req.user.id });

    res.json({
      success: true,
      message: 'User projects fetched successfully',
      data: { projects }
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user projects',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
