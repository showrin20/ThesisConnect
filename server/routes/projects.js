const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const User = require('../models/User');

const router = express.Router();

//////////////////////////
// 📁 FILE UPLOAD SETUP
//////////////////////////
const uploadsDir = path.join(__dirname, '../Uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${req.user.id}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

//////////////////////////
// 🔐 AUTH MIDDLEWARE
//////////////////////////
const auth = (req, res, next) => {
  let token = req.header('x-auth-token') || '';
  const authHeader = req.header('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

//////////////////////////
// 🔗 URL VALIDATION UTIL
//////////////////////////
const isValidURL = url => {
  try { new URL(url); return true; } catch { return false; }
};

//////////////////////////
// 📌 CREATE PROJECT
//////////////////////////
router.post('/', auth, upload.single('thesisPdf'), async (req, res) => {
  try {
    let { title, description, link, tags, status, collaborators, thesisDraft, isPrivate } = req.body;

    // Parse collaborators if sent as JSON string (from form-data)
    if (typeof collaborators === 'string') {
      try { collaborators = JSON.parse(collaborators); } catch { collaborators = []; }
    }

    if (!title || !description)
      return res.status(400).json({ msg: 'Title and description are required' });

    let parsedThesisDraft = {};
    if (thesisDraft) {
      try { parsedThesisDraft = typeof thesisDraft === 'string' ? JSON.parse(thesisDraft) : thesisDraft; }
      catch (error) { /* Failed to parse thesisDraft */ }
    }

    const hasLink = link?.trim();
    const hasThesisDraft = req.file || parsedThesisDraft?.externalLink?.trim();
    if (!hasLink && !hasThesisDraft)
      return res.status(400).json({ msg: 'Either project link or thesis draft is required' });

    if (hasLink && !isValidURL(link))
      return res.status(400).json({ msg: 'Invalid project link URL' });
    if (parsedThesisDraft?.externalLink && !isValidURL(parsedThesisDraft.externalLink))
      return res.status(400).json({ msg: 'Invalid thesis draft external link URL' });

    let thesisDraftData = {};
    if (req.file) thesisDraftData = {
      pdfUrl: `/Uploads/${req.file.filename}`,
      pdfFileName: req.file.originalname,
      pdfSize: req.file.size,
      description: parsedThesisDraft.description || '',
      uploadedAt: new Date(),
    };
    else if (parsedThesisDraft?.externalLink) thesisDraftData = {
      externalLink: parsedThesisDraft.externalLink,
      description: parsedThesisDraft.description || '',
      uploadedAt: new Date(),
    };

    // Collaborators are now added through collaboration requests, not instantly
    // const project = new Project({
    //   title,
    //   description,
    //   link: link || '',
    //   tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    //   status: status || 'Planned',
    //   collaborators: [], // Start with no collaborators
    //   creator: req.user.id,
    //   thesisDraft: Object.keys(thesisDraftData).length ? thesisDraftData : undefined,
    // });

    const project = new Project({
      title,
      description,
      link: link || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      status: status || 'Planned',
      isPrivate: isPrivate === 'true' || isPrivate === true,
      collaborators: [], // Start with no collaborators
      creator: req.user.id,
      thesisDraft: Object.keys(thesisDraftData).length ? thesisDraftData : undefined,
    });

    await project.save();
    await project.populate('creator', 'name email university');

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (unlinkError) { /* Failed to cleanup uploaded file */ }
    }
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ msg: 'File size too large. Max 10MB.' });
    res.status(500).json({ msg: 'Server error while creating project', error: error.message });
  }
});

//////////////////////////
// 🔍 SEARCH COLLABORATORS
//////////////////////////
router.get('/search-collaborators', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ success: true, data: [] });

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }],
      role: { $in: ['mentor', 'student'] }, // Only mentors or students
    }).limit(10).select('_id name email role');

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while searching collaborators', error: error.message });
  }
});

//////////////////////////
// 📌 GET ALL PROJECTS
//////////////////////////
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // If user is not authenticated, only show public projects
    if (!req.header('x-auth-token') && !req.header('Authorization')) {
      query.isPrivate = { $ne: true };
    } else {
      // Try to authenticate the user
      try {
        let token = req.header('x-auth-token') || '';
        const authHeader = req.header('Authorization');
        if (!token && authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
        
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;
          
          // If authenticated, show public projects + their own projects + projects they collaborate on
          query = {
            $or: [
              { isPrivate: { $ne: true } }, // Public projects
              { creator: userId },          // User's own projects
              { collaborators: userId }     // Projects where user is a collaborator
            ]
          };
        } else {
          // If no valid token, only show public projects
          query.isPrivate = { $ne: true };
        }
      } catch (err) {
        // If token verification fails, only show public projects
        query.isPrivate = { $ne: true };
      }
    }
    
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('creator', 'name email university')
        .populate('collaborators', 'name email role')
        .sort({ createdAt: -1 }),
      Project.countDocuments(query)
    ]);

    res.json({ success: true, total, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while fetching projects', error: error.message });
  }
});

//////////////////////////
// 📌 GET MY PROJECTS
//////////////////////////
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { creator: req.user.id },
        { collaborators: req.user.id }
      ]
    })
      .populate('creator', 'name email university')
      .populate('collaborators', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while fetching your projects', error: error.message });
  }
});

//////////////////////////
// 📌 UPDATE PROJECT
//////////////////////////
router.put('/:id', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Allow creator, collaborators, or admin to update
    if (
      project.creator.toString() !== req.user.id &&
      !project.collaborators.includes(req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Unauthorized to update this project' });
    }

    let { title, description, link, tags, status, collaborators, isPrivate } = req.body;

    // Parse collaborators if sent as JSON string (from form-data)
    if (typeof collaborators === 'string') {
      try { collaborators = JSON.parse(collaborators); } catch { collaborators = []; }
    }

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (link !== undefined) {
      if (link && !isValidURL(link)) return res.status(400).json({ msg: 'Invalid project link URL' });
      project.link = link;
    }
    if (tags !== undefined) project.tags = Array.isArray(tags) ? tags : [];
    if (status !== undefined) project.status = status;
    if (isPrivate !== undefined) project.isPrivate = isPrivate === 'true' || isPrivate === true;

    // Collaborators are now managed through collaboration requests, not direct updates
    // if (collaborators !== undefined && Array.isArray(collaborators)) {
    //   const validCollaborators = await User.find({ _id: { $in: collaborators } }).select('_id');
    //   project.collaborators = validCollaborators.map(u => u._id);
    // }

    await project.save();
    await project.populate('creator', 'name email university');
    res.json({ success: true, msg: 'Project updated', data: project });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while updating project', error: error.message });
  }
});

//////////////////////////
// 📌 GET PROJECT COLLABORATORS
//////////////////////////
router.get('/:id/collaborators', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId)
      .populate('collaborators', 'name email role')
      .select('collaborators');

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    res.json({ success: true, data: project.collaborators });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while fetching project collaborators', error: error.message });
  }
});

//////////////////////////
// 📌 GET USER PROJECTS
//////////////////////////
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ msg: 'Invalid user ID format' });

    let query = { creator: userId };
    let isAuthenticated = false;
    let authUserId = null;

    // Check if user is authenticated
    try {
      let token = req.header('x-auth-token') || '';
      const authHeader = req.header('Authorization');
      if (!token && authHeader?.startsWith('Bearer ')) token = authHeader.substring(7);
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAuthenticated = true;
        authUserId = decoded.id;
      }
    } catch (err) {
      // Token verification failed, consider as not authenticated
    }

    // If the requester is not the creator of these projects, only show public ones
    if (!isAuthenticated || authUserId !== userId) {
      query.isPrivate = { $ne: true };
    }

    const projects = await Project.find(query)
      .populate('creator', 'name email university')
      .populate('collaborators', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while fetching user projects', error: error.message });
  }
});

//////////////////////////
// 📌 ADD COLLABORATOR (when collaboration request is accepted)
//////////////////////////
router.post('/:id/collaborators', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Only project creator can add collaborators
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only project creator can add collaborators' });
    }

    const { collaboratorId } = req.body;
    if (!collaboratorId || !mongoose.Types.ObjectId.isValid(collaboratorId)) {
      return res.status(400).json({ msg: 'Valid collaborator ID is required' });
    }

    // Check if user exists and is a valid collaborator
    const user = await User.findById(collaboratorId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if already a collaborator
    if (project.collaborators.includes(collaboratorId)) {
      return res.status(400).json({ msg: 'User is already a collaborator' });
    }

    // Add collaborator
    project.collaborators.push(collaboratorId);
    await project.save();

    await project.populate('creator', 'name email university');
    await project.populate('collaborators', 'name email role');

    res.json({ success: true, msg: 'Collaborator added successfully', data: project });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while adding collaborator', error: error.message });
  }
});

//////////////////////////
// 📌 REMOVE COLLABORATOR
//////////////////////////
router.delete('/:id/collaborators/:collaboratorId', auth, async (req, res) => {
  const { id: projectId, collaboratorId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(collaboratorId)) {
      return res.status(400).json({ msg: 'Invalid ID format' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Only project creator can remove collaborators
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Only project creator can remove collaborators' });
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(id => id.toString() !== collaboratorId);
    await project.save();

    await project.populate('creator', 'name email university');
    await project.populate('collaborators', 'name email role');

    res.json({ success: true, msg: 'Collaborator removed successfully', data: project });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while removing collaborator', error: error.message });
  }
});

//////////////////////////
// 📝 ADD PROJECT REVIEW
//////////////////////////
router.post('/:id/reviews', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ msg: 'Invalid project ID format' });

    // Check if user is a mentor
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'mentor')
      return res.status(403).json({ msg: 'Only mentors can add reviews' });

    const { comment, rating } = req.body;
    if (!comment)
      return res.status(400).json({ msg: 'Review comment is required' });

    const project = await Project.findById(projectId);
    if (!project)
      return res.status(404).json({ msg: 'Project not found' });

    // Add review using the model method
    await project.addReview(req.user.id, comment, rating);

    // Return updated project with populated fields
    const updatedProject = await Project.findById(projectId)
      .populate('creator', 'name email university')
      .populate('collaborators', 'name email role')
      .populate('reviews.reviewer', 'name email role');

    res.json({ 
      success: true, 
      msg: 'Review added successfully', 
      data: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while adding review', error: error.message });
  }
});

//////////////////////////
// 📝 GET PROJECT REVIEWS
//////////////////////////
  router.get('/:id/reviews', async (req, res) => {
    const projectId = req.params.id;
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId))
        return res.status(400).json({ msg: 'Invalid project ID format' });

      const project = await Project.findById(projectId)
        .populate('reviews.reviewer', 'name email role')
        .select('reviews');

      if (!project)
        return res.status(404).json({ msg: 'Project not found' });

      res.json({ 
        success: true, 
        data: project.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      });
    } catch (error) {
      res.status(500).json({ msg: 'Server error while fetching reviews', error: error.message });
    }
  });


//////////////////////////
// 📝 DELETE PROJECT REVIEWS
//////////////////////////

router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
  const projectId = req.params.id;
  const reviewId = req.params.reviewId;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ msg: 'Invalid project ID format' });

    if (!mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ msg: 'Invalid review ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is the reviewer
    const review = project.reviews.find(r => r.id === reviewId);
    if (!review) return res.status(404).json({ msg: 'Review not found' });

    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to delete this review' });
    }

    project.reviews = project.reviews.filter(r => r.id !== reviewId);
    await project.save();

    res.json({ success: true, msg: 'Review deleted successfully', data: project });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while deleting review', error: error.message });
  }
});

//////////////////////////
// 📝 UPDATE PROJECT REVIEWS
//////////////////////////
router.put('/:id/reviews/:reviewId', auth, async (req, res) => {
  const projectId = req.params.id;
  const reviewId = req.params.reviewId;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ msg: 'Invalid project ID format' });

    if (!mongoose.Types.ObjectId.isValid(reviewId))
      return res.status(400).json({ msg: 'Invalid review ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Check if user is the reviewer
    const review = project.reviews.find(r => r.id === reviewId);
    if (!review) return res.status(404).json({ msg: 'Review not found' });

    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to update this review' });
    }

    const { comment, rating } = req.body;
    if (!comment) return res.status(400).json({ msg: 'Review comment is required' });

    // Update review
    review.comment = comment;
    if (rating !== undefined) review.rating = rating;

    await project.save();

    // Return updated project with populated fields
    await project.populate('reviews.reviewer', 'name email role');
    
    res.json({ success: true, msg: 'Review updated successfully', data: project });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while updating review', error: error.message });
  }
});

//////////////////////////
// 📌 TOGGLE PROJECT PRIVACY
//////////////////////////
router.patch('/:id/privacy', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Only project creator or admin can change privacy settings
    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to change project privacy' });
    }

    const { isPrivate } = req.body;
    
    // Update privacy status
    project.isPrivate = isPrivate === true || isPrivate === 'true';
    await project.save();

    await project.populate('creator', 'name email university');
    await project.populate('collaborators', 'name email role');
    
    res.json({ 
      success: true, 
      msg: `Project is now ${project.isPrivate ? 'private' : 'public'}`,
      data: project 
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while updating project privacy', error: error.message });
  }
});

//////////////////////////
// 📌 DELETE PROJECT
//////////////////////////
router.delete('/:id', auth, async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return res.status(400).json({ msg: 'Invalid project ID format' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.collaborators.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Collaborators cannot delete projects, only edit them' });
    }

    if (project.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized to delete this project' });
    }

    const deleteResult = await Project.deleteOne({ _id: projectId });
    if (deleteResult.deletedCount === 0) return res.status(500).json({ msg: 'Failed to delete project' });

    res.json({ success: true, msg: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error while deleting project', error: error.message });
  }
});

module.exports = router;