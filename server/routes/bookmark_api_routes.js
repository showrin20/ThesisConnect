const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const Project = require('../models/Project');

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
// 🔖 ADD BOOKMARK
//////////////////////////
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, type = 'project' } = req.body;

    if (!projectId) {
      return res.status(400).json({ msg: 'Project ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }

    // Validate that the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      projectId: projectId
    });

    if (existingBookmark) {
      return res.status(400).json({ msg: 'Project already bookmarked' });
    }

    // Create new bookmark
    const bookmark = new Bookmark({
      user: req.user.id,
      projectId: projectId,
      type: type,
      projectTitle: project.title,
      projectDescription: project.description
    });

    await bookmark.save();
    await bookmark.populate(['user', 'projectId']);

    res.status(201).json({
      success: true,
      message: 'Project bookmarked successfully',
      data: bookmark
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ msg: 'Server error while adding bookmark', error: error.message });
  }
});

//////////////////////////
// 📋 GET USER BOOKMARKS
//////////////////////////
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type,
      search 
    } = req.query;

    // Build query
    let query = { user: req.user.id };

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { projectDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookmarks = await Bookmark.find(query)
      .populate('user', 'name email')
      .populate('projectId', 'title description tags status creator')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookmarks = await Bookmark.countDocuments(query);
    const totalPages = Math.ceil(totalBookmarks / parseInt(limit));

    res.json({
      success: true,
      count: bookmarks.length,
      totalBookmarks,
      totalPages,
      currentPage: parseInt(page),
      data: bookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ msg: 'Server error while fetching bookmarks', error: error.message });
  }
});

//////////////////////////
// 🔍 CHECK IF PROJECT IS BOOKMARKED
//////////////////////////
router.get('/check/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }

    const bookmark = await Bookmark.findOne({
      user: req.user.id,
      projectId: projectId
    });

    res.json({
      success: true,
      bookmarked: !!bookmark,
      bookmarkId: bookmark ? bookmark._id : null
    });
  } catch (error) {
    console.error('Check bookmark error:', error);
    res.status(500).json({ msg: 'Server error while checking bookmark', error: error.message });
  }
});

//////////////////////////
// ❌ REMOVE BOOKMARK
//////////////////////////
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookmarkId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(bookmarkId)) {
      return res.status(400).json({ msg: 'Invalid bookmark ID format' });
    }

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return res.status(404).json({ msg: 'Bookmark not found' });
    }

    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this bookmark' });
    }

    await Bookmark.deleteOne({ _id: bookmarkId });

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({ msg: 'Server error while removing bookmark', error: error.message });
  }
});

//////////////////////////
// ❌ REMOVE BOOKMARK BY PROJECT ID
//////////////////////////
router.delete('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }

    const bookmark = await Bookmark.findOne({
      user: req.user.id,
      projectId: projectId
    });

    if (!bookmark) {
      return res.status(404).json({ msg: 'Bookmark not found' });
    }

    await Bookmark.deleteOne({ _id: bookmark._id });

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Delete bookmark by project error:', error);
    res.status(500).json({ msg: 'Server error while removing bookmark', error: error.message });
  }
});

//////////////////////////
// 📊 GET BOOKMARK STATISTICS
//////////////////////////
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalBookmarks = await Bookmark.countDocuments({ user: userId });
    
    // Bookmarks by type
    const bookmarksByType = await Bookmark.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Recent bookmarks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookmarks = await Bookmark.countDocuments({
      user: userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Most bookmarked projects
    const popularProjects = await Bookmark.aggregate([
      { $group: { _id: '$projectId', count: { $sum: 1 }, title: { $first: '$projectTitle' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalBookmarks,
        bookmarksByType,
        recentBookmarks,
        popularProjects
      }
    });
  } catch (error) {
    console.error('Get bookmark statistics error:', error);
    res.status(500).json({ msg: 'Server error while fetching bookmark statistics', error: error.message });
  }
});

//////////////////////////
// 🔄 BULK BOOKMARK OPERATIONS
//////////////////////////
router.post('/bulk', auth, async (req, res) => {
  try {
    const { projectIds, action } = req.body;

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ msg: 'Project IDs array is required' });
    }

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ msg: 'Action must be either "add" or "remove"' });
    }

    const validProjectIds = projectIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validProjectIds.length === 0) {
      return res.status(400).json({ msg: 'No valid project IDs provided' });
    }

    let result;
    
    if (action === 'add') {
      // Validate projects exist
      const existingProjects = await Project.find({ _id: { $in: validProjectIds } });
      
      if (existingProjects.length !== validProjectIds.length) {
        return res.status(404).json({ msg: 'Some projects not found' });
      }

      // Check for existing bookmarks
      const existingBookmarks = await Bookmark.find({
        user: req.user.id,
        projectId: { $in: validProjectIds }
      });

      const existingProjectIds = existingBookmarks.map(b => b.projectId.toString());
      const newProjectIds = validProjectIds.filter(id => !existingProjectIds.includes(id));

      if (newProjectIds.length === 0) {
        return res.status(400).json({ msg: 'All projects are already bookmarked' });
      }

      // Create new bookmarks
      const bookmarksToCreate = existingProjects
        .filter(project => newProjectIds.includes(project._id.toString()))
        .map(project => ({
          user: req.user.id,
          projectId: project._id,
          type: 'project',
          projectTitle: project.title,
          projectDescription: project.description
        }));

      result = await Bookmark.insertMany(bookmarksToCreate);

      res.json({
        success: true,
        message: `${result.length} projects bookmarked successfully`,
        added: result.length,
        skipped: existingBookmarks.length
      });

    } else if (action === 'remove') {
      result = await Bookmark.deleteMany({
        user: req.user.id,
        projectId: { $in: validProjectIds }
      });

      res.json({
        success: true,
        message: `${result.deletedCount} bookmarks removed successfully`,
        removed: result.deletedCount
      });
    }

  } catch (error) {
    console.error('Bulk bookmark operation error:', error);
    res.status(500).json({ msg: 'Server error during bulk operation', error: error.message });
  }
});

//////////////////////////
// 📤 EXPORT BOOKMARKS
//////////////////////////
router.get('/export', auth, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate('projectId', 'title description tags status creator')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Title,Description,Tags,Status,Bookmarked Date\n';
      const csvRows = bookmarks.map(bookmark => {
        const project = bookmark.projectId;
        return `"${project.title}","${project.description}","${project.tags.join(';')}","${project.status}","${bookmark.createdAt.toISOString()}"`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.csv"');
      res.send(csvHeader + csvRows);
    } else {
      // JSON format
      res.json({
        success: true,
        exportDate: new Date().toISOString(),
        totalBookmarks: bookmarks.length,
        data: bookmarks
      });
    }
  } catch (error) {
    console.error('Export bookmarks error:', error);
    res.status(500).json({ msg: 'Server error while exporting bookmarks', error: error.message });
  }
});

module.exports = router;