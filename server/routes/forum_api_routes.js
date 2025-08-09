const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Forum = require('../models/Forum');

const router = express.Router();

//////////////////////////
// 🔐 AUTH MIDDLEWARE
//////////////////////////
const auth = (req, res, next) => {
  let token = req.header('x-auth-token') || '';

  const authHeader = req.header('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

//////////////////////////
// 📝 CREATE FORUM POST
//////////////////////////
router.post('/', auth, async (req, res) => {
  try {
    const { title, type, description, tags, date, externalLink } = req.body;

    // Validation
    if (!title || !type || !description) {
      return res.status(400).json({ msg: 'Title, type, and description are required' });
    }

    // Validate post type
    const validTypes = ['conference', 'journal', 'publication'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ msg: 'Invalid post type' });
    }

    // Validate external link if provided
    if (externalLink && !isValidURL(externalLink)) {
      return res.status(400).json({ msg: 'Invalid external link URL' });
    }

    const forumPost = new Forum({
      title,
      type,
      description,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      date: date || new Date().toISOString().split('T')[0],
      externalLink: externalLink || '',
      author: req.user.id,
      likes: 0,
      comments: 0,
      views: 0
    });

    await forumPost.save();
    await forumPost.populate('author', 'name email university');

    res.status(201).json({ 
      success: true, 
      message: 'Forum post created successfully',
      data: forumPost 
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ msg: 'Server error while creating forum post', error: error.message });
  }
});

//////////////////////////
// 📋 GET ALL FORUM POSTS
//////////////////////////
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      type, 
      dateFrom, 
      dateTo, 
      tags,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = dateFrom;
      if (dateTo) query.date.$lte = dateTo;
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const forumPosts = await Forum.find(query)
      .populate('author', 'name email university')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Forum.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    res.json({
      success: true,
      count: forumPosts.length,
      totalPosts,
      totalPages,
      currentPage: parseInt(page),
      data: forumPosts
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ msg: 'Server error while fetching forum posts', error: error.message });
  }
});

//////////////////////////
// 📖 GET SINGLE FORUM POST
//////////////////////////
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: 'Invalid post ID format' });
    }

    const forumPost = await Forum.findById(postId)
      .populate('author', 'name email university');

    if (!forumPost) {
      return res.status(404).json({ msg: 'Forum post not found' });
    }

    // Increment views
    forumPost.views += 1;
    await forumPost.save();

    res.json({
      success: true,
      data: forumPost
    });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ msg: 'Server error while fetching forum post', error: error.message });
  }
});

//////////////////////////
//✏️ UPDATE FORUM POST
//////////////////////////
router.put('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: 'Invalid post ID format' });
    }

    const forumPost = await Forum.findById(postId);
    if (!forumPost) {
      return res.status(404).json({ msg: 'Forum post not found' });
    }

    // Check if user owns the post
    if (forumPost.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to update this post' });
    }

    const { title, type, description, tags, date, externalLink } = req.body;

    // Validate post type if provided
    if (type) {
      const validTypes = ['conference', 'journal', 'publication'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ msg: 'Invalid post type' });
      }
    }

    // Validate external link if provided
    if (externalLink && !isValidURL(externalLink)) {
      return res.status(400).json({ msg: 'Invalid external link URL' });
    }

    // Update fields
    if (title !== undefined) forumPost.title = title;
    if (type !== undefined) forumPost.type = type;
    if (description !== undefined) forumPost.description = description;
    if (tags !== undefined) forumPost.tags = Array.isArray(tags) ? tags : [];
    if (date !== undefined) forumPost.date = date;
    if (externalLink !== undefined) forumPost.externalLink = externalLink;

    await forumPost.save();
    await forumPost.populate('author', 'name email university');

    res.json({
      success: true,
      message: 'Forum post updated successfully',
      data: forumPost
    });
  } catch (error) {
    console.error('Update forum post error:', error);
    res.status(500).json({ msg: 'Server error while updating forum post', error: error.message });
  }
});

//////////////////////////
// ❌ DELETE FORUM POST
//////////////////////////
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: 'Invalid post ID format' });
    }

    const forumPost = await Forum.findById(postId);
    if (!forumPost) {
      return res.status(404).json({ msg: 'Forum post not found' });
    }

    // Check if user owns the post
    if (forumPost.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this post' });
    }

    await Forum.deleteOne({ _id: postId });

    res.json({
      success: true,
      message: 'Forum post deleted successfully'
    });
  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({ msg: 'Server error while deleting forum post', error: error.message });
  }
});

//////////////////////////
// 👍 LIKE/UNLIKE POST
//////////////////////////
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: 'Invalid post ID format' });
    }

    const forumPost = await Forum.findById(postId);
    if (!forumPost) {
      return res.status(404).json({ msg: 'Forum post not found' });
    }

    // Check if user already liked the post
    const userLikeIndex = forumPost.likedBy.indexOf(req.user.id);
    
    if (userLikeIndex > -1) {
      // User already liked, so unlike
      forumPost.likedBy.splice(userLikeIndex, 1);
      forumPost.likes = Math.max(0, forumPost.likes - 1);
    } else {
      // User hasn't liked, so like
      forumPost.likedBy.push(req.user.id);
      forumPost.likes += 1;
    }

    await forumPost.save();

    res.json({
      success: true,
      message: userLikeIndex > -1 ? 'Post unliked' : 'Post liked',
      likes: forumPost.likes,
      liked: userLikeIndex === -1
    });
  } catch (error) {
    console.error('Like forum post error:', error);
    res.status(500).json({ msg: 'Server error while liking post', error: error.message });
  }
});

//////////////////////////
// 📊 GET FORUM STATISTICS
//////////////////////////
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPosts = await Forum.countDocuments();
    const totalConferences = await Forum.countDocuments({ type: 'conference' });
    const totalJournals = await Forum.countDocuments({ type: 'journal' });
    const totalPublications = await Forum.countDocuments({ type: 'publication' });
    
    // Posts created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await Forum.countDocuments({ createdAt: { $gte: today } });

    // Most popular tags
    const tagStats = await Forum.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        totalConferences,
        totalJournals,
        totalPublications,
        newToday,
        popularTags: tagStats
      }
    });
  } catch (error) {
    console.error('Get forum statistics error:', error);
    res.status(500).json({ msg: 'Server error while fetching statistics', error: error.message });
  }
});

//////////////////////////
// 🔍 SEARCH POSTS BY TAGS
//////////////////////////
router.get('/search/tags/:tag', async (req, res) => {
  try {
    const tag = req.params.tag;
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Forum.find({ tags: { $in: [tag] } })
      .populate('author', 'name email university')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPosts = await Forum.countDocuments({ tags: { $in: [tag] } });

    res.json({
      success: true,
      count: posts.length,
      totalPosts,
      currentPage: parseInt(page),
      data: posts
    });
  } catch (error) {
    console.error('Search posts by tag error:', error);
    res.status(500).json({ msg: 'Server error while searching posts', error: error.message });
  }
});

// URL validation utility
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

module.exports = router;