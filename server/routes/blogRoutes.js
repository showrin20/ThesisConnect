const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // For file cleanup
const Blog = require('../models/Blog');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, or WebP allowed.'));
    }
  }
});

// =========================
// Create blog (Requires authentication)
// =========================
router.post(
  '/',
  auth,
  upload.single('featuredImage'),
  [
    body('title').trim().notEmpty().withMessage('Blog title is required').isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
    body('content').trim().notEmpty().withMessage('Blog content is required').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
    body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
    body('category').isIn(['Research', 'Technology', 'Academia', 'Tutorial', 'Opinion', 'News', 'Review', 'Personal']).withMessage('Invalid category'),
    body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    body('tags').optional().customSanitizer(value => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      }
      return value || [];
    }).isArray().withMessage('Tags must be an array').custom(tags => tags.every(tag => typeof tag === 'string' && tag.length <= 30)).withMessage('Each tag must be a string and no longer than 30 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map(e => e.msg) });
      }

      const blogData = {
        ...req.body,
        author: req.user.id,
        featuredImage: req.file ? `/uploads/${req.file.filename}` : req.body.featuredImage
      };

      const blog = new Blog(blogData);
      await blog.save();

      const populatedBlog = await Blog.findById(blog._id).populate('author', 'name email');

      res.json({
        success: true,
        data: populatedBlog,
        message: 'Blog created successfully'
      });
    } catch (err) {
      console.error('Error creating blog:', err);
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.eårrors).map(e => e.message);
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// =========================
// Get all blogs
// =========================
router.get(
  '/',
  [
    query('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    query('category').optional().isIn(['research', 'technology', 'academia', 'tutorial', 'opinion', 'news', 'review', 'personal']).withMessage('Invalid category'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map(e => e.msg) });
      }

      const { status, category, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const query = { isDeleted: { $ne: true } };
      if (status) {
        query.status = status;
      }
      if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') }; // Case-insensitive match
      }

      const blogs = await Blog.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await Blog.countDocuments(query);

      res.json({
        success: true,
        data: blogs,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      });
    } catch (err) {
      console.error('Error fetching blogs:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// =========================
// Get user's blogs (Requires authentication)
// =========================
router.get('/my-blogs', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching blogs for user:', req.user.id);

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ author: req.user.id, isDeleted: { $ne: true } })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Blog.countDocuments({ author: req.user.id, isDeleted: { $ne: true } });

    console.log(`📝 Found ${blogs.length} blogs for user ${req.user.id}`);

    res.json({
      success: true,
      data: blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (err) {
    console.error('Error fetching user blogs:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Get single blog
// =========================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Update blog (Requires authentication + ownership)
// =========================
router.put(
  '/:id',
  auth,
  upload.single('featuredImage'),
  [
    body('title').trim().notEmpty().withMessage('Blog title is required').isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
    body('content').trim().notEmpty().withMessage('Blog content is required').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
    body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
    body('category').isIn(['Research', 'Technology', 'Academia', 'Tutorial', 'Opinion', 'News', 'Review', 'Personal']).withMessage('Invalid category'),
    body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
    body('tags').optional().customSanitizer(value => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      }
      return value || [];
    }).isArray().withMessage('Tags must be an array').custom(tags => tags.every(tag => typeof tag === 'string' && tag.length <= 30)).withMessage('Each tag must be a string and no longer than 30 characters')
  ],
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map(e => e.msg) });
      }

      const existingBlog = await Blog.findById(id);
      if (!existingBlog || existingBlog.isDeleted) {
        return res.status(404).json({ success: false, message: 'Blog not found' });
      }

      if (existingBlog.author.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only update your own blogs.' });
      }

      // Delete old featured image if a new one is uploaded
      if (req.file && existingBlog.featuredImage) {
        try {
          await fs.unlink(path.join(__dirname, '..', existingBlog.featuredImage));
        } catch (err) {
          console.warn('Failed to delete old featured image:', err.message);
        }
      }

      const blogData = {
        ...req.body,
        featuredImage: req.file ? `/uploads/${req.file.filename}` : existingBlog.featuredImage
      };

      const blog = await Blog.findByIdAndUpdate(id, blogData, {
        new: true,
        runValidators: true
      }).populate('author', 'name email');

      res.json({
        success: true,
        data: blog,
        message: 'Blog updated successfully'
      });
    } catch (err) {
      console.error('Error updating blog:', err);
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// =========================
// Delete blog (Requires authentication + ownership)
// =========================
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const existingBlog = await Blog.findById(id);
    if (!existingBlog || existingBlog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (existingBlog.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only delete your own blogs.' });
    }

    // Delete featured image if exists
    if (existingBlog.featuredImage) {
      try {
        await fs.unlink(path.join(__dirname, '..', existingBlog.featuredImage));
      } catch (err) {
        console.warn('Failed to delete featured image:', err.message);
      }
    }

    await Blog.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Like blog (No authentication required)
// =========================
router.patch('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.likes = (blog.likes || 0) + 1;
    await blog.save();

    const updatedBlog = await Blog.findById(id).populate('author', 'name email');

    res.json({
      success: true,
      data: updatedBlog,
      likes: updatedBlog.likes,
      message: 'Blog liked successfully'
    });
  } catch (err) {
    console.error('Error liking blog:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// View blog (No authentication required)
// =========================
router.patch('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.views = (blog.views || 0) + 1;
    await blog.save();

    const updatedBlog = await Blog.findById(id).populate('author', 'name email');

    res.json({
      success: true,
      data: updatedBlog,
      views: updatedBlog.views,
      message: 'View count updated'
    });
  } catch (err) {
    console.error('Error updating blog views:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Get blogs by specific userId (Public)
// =========================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ author: userId, isDeleted: { $ne: true } })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({ author: userId, isDeleted: { $ne: true } });

    res.json({
      success: true,
      data: blogs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      userId
    });
  } catch (err) {
    console.error('Error fetching blogs for user:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// =========================
// Blog statistics (Requires authentication)
// =========================
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Blog.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(req.user.id), isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    const formattedStats = {
      published: stats.find(s => s._id === 'published') || { count: 0, totalViews: 0, totalLikes: 0 },
      draft: stats.find(s => s._id === 'draft') || { count: 0, totalViews: 0, totalLikes: 0 },
      archived: stats.find(s => s._id === 'archived') || { count: 0, totalViews: 0, totalLikes: 0 },
      total: stats.reduce((sum, s) => sum + s.count, 0)
    };

    res.json({ success: true, data: formattedStats });
  } catch (err) {
    console.error('Error fetching blog stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;