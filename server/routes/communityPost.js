const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const CommunityPostService = require('../services/communityPostService');
const Project = require('../models/Project');
const { auth } = require('../middlewares/auth');

// ===== VALIDATION MIDDLEWARE =====
const validateCreatePost = [
  body('type').isIn(['collab', 'general']),
  body('content').trim().isLength({ min: 1, max: 300 }),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('skillsNeeded').optional().isArray(),
  body('status').optional().isIn(['open', 'closed', 'in-progress']),
  body('tags').optional().isArray(),
  body('projectId').optional().isMongoId(),
];

const validateUpdatePost = [
  body('type').optional().isIn(['collab', 'general']),
  body('content').optional().trim().isLength({ min: 1, max: 300 }),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('skillsNeeded').optional().isArray(),
  body('status').optional().isIn(['open', 'closed', 'in-progress']),
  body('tags').optional().isArray(),
  body('projectId').optional().isMongoId(),
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['collab', 'general']),
];

// ===== VALIDATION ERROR HANDLER =====
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

// ===== ROUTES =====

// GET: User's posts
router.get('/my-posts', auth, validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      type: req.query.type,
    };
    const result = await CommunityPostService.getUserPosts(req.user.id, options);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: User's projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ creator: req.user.id });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Create post
router.post('/', auth, validateCreatePost, handleValidationErrors, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      postId: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    if (postData.projectId) {
      const project = await Project.findById(postData.projectId);
      if (!project || String(project.creator) !== String(req.user.id)) {
        return res.status(400).json({ success: false, message: 'Invalid project selected.' });
      }
    }

    const post = await CommunityPostService.createPost(postData, req.user.id);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: All posts
router.get('/', validatePagination, handleValidationErrors, async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      type: req.query.type,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
    };
    const result = await CommunityPostService.getAllPosts(options);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Single post
router.get('/:postId', async (req, res) => {
  try {
    const post = await CommunityPostService.getPostById(req.params.postId);
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// PUT: Update post
router.put('/:postId', auth, validateUpdatePost, handleValidationErrors, async (req, res) => {
  try {
    if (req.body.projectId) {
      const project = await Project.findById(req.body.projectId);
      if (!project || String(project.creator) !== String(req.user.id)) {
        return res.status(400).json({ success: false, message: 'Invalid project selected.' });
      }
    }

    const updatedPost = await CommunityPostService.updatePost(
      req.params.postId,
      req.body,
      req.user.id,
      req.user.role
    );

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
});

// DELETE: Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const result = await CommunityPostService.deletePost(
      req.params.postId,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, message: result.message });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
});

// POST: Toggle like/unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await CommunityPostService.toggleLike(req.params.postId, req.user.id);
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Add comment
router.post('/:postId/comments', auth, [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment text is required and must be under 500 characters'),
], handleValidationErrors, async (req, res) => {
  try {
    const commentData = {
      text: req.body.text,
      commentId: req.body.commentId || `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const post = await CommunityPostService.addComment(
      req.params.postId,
      commentData,
      req.user.id,
      req.user.name || 'Anonymous',
      req.user.role
    );
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Get comments
router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await CommunityPostService.getComments(req.params.postId);
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Like/unlike comment
router.post('/:postId/comments/:commentId/like', auth, async (req, res) => {
  try {
    const post = await CommunityPostService.toggleCommentLike(
      req.params.postId,
      req.params.commentId,
      req.user.id
    );
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE: Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await CommunityPostService.deleteComment(
      req.params.postId,
      req.params.commentId,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
});

module.exports = router;
