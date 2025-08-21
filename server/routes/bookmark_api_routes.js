const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const Project = require('../models/Project');
const Publication = require('../models/publicationSchema');
const Blog = require('../models/Blog');
const CommunityPost = require('../models/CommunityPostSchema');

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
      return res.status(400).json({ msg: 'Content ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid content ID format' });
    }

    // Validate that the content type is supported
    if (!['project', 'publication', 'blog', 'community'].includes(type)) {
      return res.status(400).json({ msg: 'Invalid content type. Must be one of: project, publication, blog, community' });
    }

    // Validate the content exists based on type
    let content;
    let contentTitle;
    let contentDescription;
    let contentModel;

    // Import the appropriate model based on content type
    let Model;
    try {
      switch (type) {
        case 'project':
          Model = require('../models/Project');
          contentModel = 'Project';
          break;
        case 'publication':
          Model = require('../models/publicationSchema');
          contentModel = 'Publication';
          break;
        case 'blog':
          Model = require('../models/Blog');
          contentModel = 'Blog';
          break;
        case 'community':
          Model = require('../models/CommunityPostSchema');
          contentModel = 'CommunityPost';
          break;
      }
    } catch (error) {
      console.error(`Error importing model for type ${type}:`, error);
      return res.status(500).json({ msg: `Error loading ${type} model. Please contact support.` });
    }

    content = await Model.findById(projectId);
    if (!content) {
      return res.status(404).json({ msg: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
    }

    // Set appropriate title and description fields based on content type
    switch (type) {
      case 'project':
        contentTitle = content.title;
        contentDescription = content.description || '';
        break;
      case 'publication':
        contentTitle = content.title;
        contentDescription = content.abstract || '';
        break;
      case 'blog':
        contentTitle = content.title;
        contentDescription = content.excerpt || content.content?.substring(0, 100) || '';
        break;
      case 'community':
        contentTitle = content.title || content.content?.substring(0, 50) || '';
        contentDescription = content.content || '';
        break;
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      projectId: projectId
    });

    if (existingBookmark) {
      return res.status(400).json({ msg: `This ${type} is already bookmarked` });
    }

    // Extract additional metadata based on content type
    let tags = [];
    let category = '';
    
    if (content.tags) {
      tags = Array.isArray(content.tags) ? content.tags : [content.tags];
    }
    
    if (content.category) {
      category = content.category;
    } else if (type === 'project' && content.status) {
      category = content.status;
    }
    
    // Create new bookmark using the updated schema fields
    const bookmark = new Bookmark({
      user: req.user.id,
      projectId: projectId,
      type: type,
      contentModel: contentModel,
      projectTitle: contentTitle,
      projectDescription: contentDescription,
      tags: tags,
      category: category
    });

    await bookmark.save();
    
    // Populate both the user reference and the dynamic projectId reference
    await bookmark.populate(['user', 'projectId']);

    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} bookmarked successfully`,
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

    // First fetch bookmarks without population to avoid reference errors
    const bookmarks = await Bookmark.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Process bookmarks with safe handling of missing references
    const processedBookmarks = bookmarks.map(bookmark => {
      // Use the bookmark's stored title and description instead of relying on populated content
      const processedBookmark = {
        ...bookmark.toObject(),
        contentDetails: {
          _id: bookmark.projectId,
          title: bookmark.projectTitle || 'Untitled',
          description: bookmark.projectDescription || '',
          type: bookmark.type,
          contentModel: bookmark.contentModel,
          tags: bookmark.tags || [],
          category: bookmark.category || '',
        }
      };
      
      return processedBookmark;
    });
    
    const totalBookmarks = await Bookmark.countDocuments(query);
    const totalPages = Math.ceil(totalBookmarks / parseInt(limit));

    res.json({
      success: true,
      count: bookmarks.length,
      totalBookmarks,
      totalPages,
      currentPage: parseInt(page),
      data: processedBookmarks
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ msg: 'Server error while fetching bookmarks', error: error.message });
  }
});

//////////////////////////
// 🔍 CHECK IF CONTENT IS BOOKMARKED
//////////////////////////
router.get('/check/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query; // Optional type parameter to check specific content type

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid content ID format' });
    }

    // Build the query
    const query = {
      user: req.user.id,
      projectId: projectId
    };
    
    // Add type to query if specified
    if (type && ['project', 'publication', 'blog', 'community'].includes(type)) {
      query.type = type;
      
      // Add contentModel based on type
      switch (type) {
        case 'project':
          query.contentModel = 'Project';
          break;
        case 'publication':
          query.contentModel = 'Publication';
          break;
        case 'blog':
          query.contentModel = 'Blog';
          break;
        case 'community':
          query.contentModel = 'CommunityPost';
          break;
      }
    }

    const bookmark = await Bookmark.findOne(query);

    res.json({
      success: true,
      bookmarked: !!bookmark,
      bookmarkId: bookmark ? bookmark._id : null,
      type: bookmark ? bookmark.type : null,
      contentModel: bookmark ? bookmark.contentModel : null
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
// ❌ REMOVE BOOKMARK BY CONTENT ID
//////////////////////////
router.delete('/content/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { type } = req.query; // Optional type parameter to specify content type

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ msg: 'Invalid content ID format' });
    }

    // Build the query
    const query = {
      user: req.user.id,
      projectId: projectId
    };
    
    // Add type and contentModel to query if specified
    if (type && ['project', 'publication', 'blog', 'community'].includes(type)) {
      query.type = type;
      
      // Add contentModel based on type
      switch (type) {
        case 'project':
          query.contentModel = 'Project';
          break;
        case 'publication':
          query.contentModel = 'Publication';
          break;
        case 'blog':
          query.contentModel = 'Blog';
          break;
        case 'community':
          query.contentModel = 'CommunityPost';
          break;
      }
    }

    const bookmark = await Bookmark.findOne(query);

    if (!bookmark) {
      return res.status(404).json({ msg: 'Bookmark not found' });
    }

    await Bookmark.deleteOne({ _id: bookmark._id });

    res.json({
      success: true,
      message: `${bookmark.type.charAt(0).toUpperCase() + bookmark.type.slice(1)} bookmark removed successfully`
    });
  } catch (error) {
    console.error('Delete bookmark by content ID error:', error);
    res.status(500).json({ msg: 'Server error while removing bookmark', error: error.message });
  }
});

//////////////////////////
// 📊 GET BOOKMARK STATISTICS
//////////////////////////
//////////////////////////
// 📑 GET BOOKMARKS BY TYPE
//////////////////////////
router.get('/by-type/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10, search } = req.query;
    
    // Validate type
    if (!['project', 'publication', 'blog', 'community'].includes(type)) {
      return res.status(400).json({ msg: 'Invalid content type. Must be one of: project, publication, blog, community' });
    }
    
    // Build query
    const query = { 
      user: req.user.id,
      type: type
    };
    
    // Add contentModel based on type
    switch (type) {
      case 'project':
        query.contentModel = 'Project';
        break;
      case 'publication':
        query.contentModel = 'Publication';
        break;
      case 'blog':
        query.contentModel = 'Blog';
        break;
      case 'community':
        query.contentModel = 'CommunityPost';
        break;
    }
    
    if (search) {
      query.$or = [
        { projectTitle: { $regex: search, $options: 'i' } },
        { projectDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookmarksQuery = Bookmark.find(query)
      .populate('user', 'name email')
      .populate('projectId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const bookmarks = await bookmarksQuery.exec();
    
    // Process bookmarks to provide consistent response structure
    const processedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark.toObject(),
      contentDetails: bookmark.projectId
    }));
    
    const totalBookmarks = await Bookmark.countDocuments(query);
    const totalPages = Math.ceil(totalBookmarks / parseInt(limit));
    
    res.json({
      success: true,
      count: bookmarks.length,
      totalBookmarks,
      totalPages,
      currentPage: parseInt(page),
      data: processedBookmarks
    });
    
  } catch (error) {
    console.error('Get bookmarks by type error:', error);
    res.status(500).json({ msg: 'Server error while fetching bookmarks', error: error.message });
  }
});

//////////////////////////
// 📊 GET BOOKMARK STATISTICS
//////////////////////////
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Handle each query separately to prevent one failure from affecting others
    let totalBookmarks = 0;
    let bookmarksByType = [];
    let recentBookmarks = 0;
    let popularContent = [];

    try {
      totalBookmarks = await Bookmark.countDocuments({ user: userId });
    } catch (err) {
      console.error('Error counting total bookmarks:', err);
    }
    
    try {
      // Bookmarks by type
      bookmarksByType = await Bookmark.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    } catch (err) {
      console.error('Error aggregating bookmarks by type:', err);
    }

    try {
      // Recent bookmarks (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      recentBookmarks = await Bookmark.countDocuments({
        user: userId,
        createdAt: { $gte: sevenDaysAgo }
      });
    } catch (err) {
      console.error('Error counting recent bookmarks:', err);
    }

    try {
      // Most bookmarked content - modified to avoid grouping issues
      popularContent = await Bookmark.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('projectTitle type contentModel createdAt')
        .lean();
        
      // Transform to match expected structure
      popularContent = popularContent.map(item => ({
        title: item.projectTitle || 'Untitled',
        type: item.type || 'unknown',
        count: 1, // Each user bookmark counts as 1
        contentModel: item.contentModel
      }));
    } catch (err) {
      console.error('Error finding popular content:', err);
    }

    res.json({
      success: true,
      data: {
        totalBookmarks,
        bookmarksByType,
        recentBookmarks,
        popularContent: popularContent
      }
    });
  } catch (error) {
    console.error('Get bookmark statistics error:', error);
    res.status(500).json({ 
      success: false,
      msg: 'Server error while fetching bookmark statistics', 
      error: error.message,
      data: {
        totalBookmarks: 0,
        bookmarksByType: [],
        recentBookmarks: 0,
        popularContent: []
      }
    });
  }
});

//////////////////////////
// 🔄 BULK BOOKMARK OPERATIONS
//////////////////////////
router.post('/bulk', auth, async (req, res) => {
  try {
    const { contentIds, action, type = 'project' } = req.body;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ msg: 'Content IDs array is required' });
    }

    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({ msg: 'Action must be either "add" or "remove"' });
    }

    // Validate content type
    if (!['project', 'publication', 'blog', 'community'].includes(type)) {
      return res.status(400).json({ msg: 'Invalid content type. Must be one of: project, publication, blog, community' });
    }

    const validContentIds = contentIds.filter(id => mongoose.Types.ObjectId.isValid(id));

    if (validContentIds.length === 0) {
      return res.status(400).json({ msg: 'No valid content IDs provided' });
    }

    let result;
    let contentModel;
    
    // Determine the content model based on type
    switch (type) {
      case 'project':
        contentModel = 'Project';
        break;
      case 'publication':
        contentModel = 'Publication';
        break;
      case 'blog':
        contentModel = 'Blog';
        break;
      case 'community':
        contentModel = 'CommunityPost';
        break;
    }

    // Import the appropriate model based on content type
    let Model;
    try {
      switch (type) {
        case 'project':
          Model = require('../models/Project');
          break;
        case 'publication':
          Model = require('../models/publicationSchema');
          break;
        case 'blog':
          Model = require('../models/Blog');
          break;
        case 'community':
          Model = require('../models/CommunityPostSchema');
          break;
      }
    } catch (error) {
      console.error(`Error importing model for type ${type}:`, error);
      return res.status(500).json({ msg: `Error loading ${type} model. Please contact support.` });
    }
    
    if (action === 'add') {
      // Validate content items exist
      const existingContent = await Model.find({ _id: { $in: validContentIds } });
      
      if (existingContent.length !== validContentIds.length) {
        return res.status(404).json({ msg: `Some ${type}s not found` });
      }

      // Check for existing bookmarks
      const existingBookmarks = await Bookmark.find({
        user: req.user.id,
        projectId: { $in: validContentIds },
        type: type
      });

      const existingContentIds = existingBookmarks.map(b => b.projectId.toString());
      const newContentIds = validContentIds.filter(id => !existingContentIds.includes(id));

      if (newContentIds.length === 0) {
        return res.status(400).json({ msg: `All ${type}s are already bookmarked` });
      }

      // Create new bookmarks based on content type
      const bookmarksToCreate = existingContent
        .filter(content => newContentIds.includes(content._id.toString()))
        .map(content => {
          let title, description;
          
          // Set appropriate title and description fields based on content type
          switch (type) {
            case 'project':
              title = content.title;
              description = content.description || '';
              break;
            case 'publication':
              title = content.title;
              description = content.abstract || '';
              break;
            case 'blog':
              title = content.title;
              description = content.excerpt || content.content?.substring(0, 100) || '';
              break;
            case 'community':
              title = content.title || content.content?.substring(0, 50) || '';
              description = content.content || '';
              break;
          }
          
          return {
            user: req.user.id,
            projectId: content._id,
            type: type,
            contentModel: contentModel,
            projectTitle: title,
            projectDescription: description
          };
        });

      result = await Bookmark.insertMany(bookmarksToCreate);

      res.json({
        success: true,
        message: `${result.length} ${type}s bookmarked successfully`,
        added: result.length,
        skipped: existingBookmarks.length
      });

    } else if (action === 'remove') {
      result = await Bookmark.deleteMany({
        user: req.user.id,
        projectId: { $in: validContentIds },
        type: type
      });

      res.json({
        success: true,
        message: `${result.deletedCount} ${type} bookmarks removed successfully`,
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
      .sort({ createdAt: -1 });
    
    // Process bookmarks to handle missing or null content references
    const processedBookmarks = bookmarks.map(bookmark => {
      return {
        id: bookmark._id,
        type: bookmark.type,
        title: bookmark.projectTitle || 'Untitled',
        description: bookmark.projectDescription || '',
        tags: bookmark.tags || [],
        category: bookmark.category || '',
        createdAt: bookmark.createdAt,
        lastVisited: bookmark.lastVisited
      };
    });

    if (format === 'csv') {
      // Convert to CSV format with proper escaping
      const csvHeader = 'Type,Title,Description,Tags,Category,Bookmarked Date\n';
      const csvRows = processedBookmarks.map(bookmark => {
        // Properly escape CSV fields to handle quotes and commas
        const escapeCSV = (field) => {
          if (field === null || field === undefined) return '""';
          const str = String(field).replace(/"/g, '""');
          return `"${str}"`;
        };
        
        const title = escapeCSV(bookmark.title);
        const description = escapeCSV(bookmark.description);
        const tags = escapeCSV(Array.isArray(bookmark.tags) ? bookmark.tags.join(';') : bookmark.tags);
        const category = escapeCSV(bookmark.category);
        const type = escapeCSV(bookmark.type);
        const date = escapeCSV(bookmark.createdAt.toISOString());
        
        return `${type},${title},${description},${tags},${category},${date}`;
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.csv"');
      res.send(csvHeader + csvRows);
    } else {
      // JSON format
      res.json({
        success: true,
        exportDate: new Date().toISOString(),
        totalBookmarks: processedBookmarks.length,
        data: processedBookmarks
      });
    }
  } catch (error) {
    console.error('Export bookmarks error:', error);
    res.status(500).json({ msg: 'Server error while exporting bookmarks', error: error.message });
  }
});

//////////////////////////
// 🕒 UPDATE LAST VISITED
//////////////////////////
router.put('/visit/:id', auth, async (req, res) => {
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
      return res.status(403).json({ msg: 'Unauthorized to update this bookmark' });
    }

    // Update last visited timestamp
    bookmark.lastVisited = new Date();
    await bookmark.save();

    res.json({
      success: true,
      message: 'Bookmark visit timestamp updated',
      data: {
        bookmarkId: bookmark._id,
        lastVisited: bookmark.lastVisited
      }
    });
  } catch (error) {
    console.error('Update bookmark visit timestamp error:', error);
    res.status(500).json({ msg: 'Server error while updating bookmark visit timestamp', error: error.message });
  }
});

module.exports = router;