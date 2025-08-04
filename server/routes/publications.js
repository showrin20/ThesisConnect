const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Publication = require('../models/publicationSchema'); 

const router = express.Router();

// 🔐 AUTH MIDDLEWARE
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

// 📌 CREATE PUBLICATION
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      authors,
      year,
      venue,
      type,
      genre,
      quality,
      tags,
      doi,
      abstract,
      citations,
      location,
    } = req.body;

    // Validate required fields
    if (!title || !authors || !Array.isArray(authors) || authors.length === 0 || !year || !venue || !type) {
      return res.status(400).json({ msg: 'Title, authors, year, venue, and type are required' });
    }

    // Optional: Validate enums for 'type' and 'quality' if you want here (or rely on Mongoose validation)

    const publication = new Publication({
      title,
      authors,
      year,
      venue,
      type,
      genre,
      quality,
      tags: Array.isArray(tags) ? tags : [],
      doi,
      abstract,
      citations: citations || 0,
      location,
      creator: req.user.id,
    });

    await publication.save();
    await publication.populate('creator', 'name email university');

    res.status(201).json({ success: true, data: publication });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({ msg: 'Server error while creating publication', error: error.message });
  }
});
router.get('/test', (req, res) => {
  res.json({ msg: 'Publications route is connected!' });
});

// 📌 GET ALL PUBLICATIONS
router.get('/', async (_req, res) => {
  try {
    const publications = await Publication.find()
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: publications.length, data: publications });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ msg: 'Server error while fetching publications', error: error.message });
  }
});

// 📌 GET MY PUBLICATIONS
router.get('/my-publications', auth, async (req, res) => {
  try {
    const publications = await Publication.find({ creator: req.user.id })
      .populate('creator', 'name email university')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: publications.length, data: publications });
  } catch (error) {
    console.error('Get my publications error:', error);
    res.status(500).json({ msg: 'Server error while fetching your publications', error: error.message });
  }
});

// ✏️ UPDATE PUBLICATION
router.put('/:id', auth, async (req, res) => {
  const pubId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(pubId)) {
      return res.status(400).json({ msg: 'Invalid publication ID format' });
    }

    const publication = await Publication.findById(pubId);
    if (!publication) return res.status(404).json({ msg: 'Publication not found' });

    if (publication.creator.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to update this publication' });
    }

    const fieldsToUpdate = [
      'title', 'authors', 'year', 'venue', 'type',
      'genre', 'quality', 'tags', 'doi', 'abstract', 'citations', 'location',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'authors' || field === 'tags') {
          publication[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          publication[field] = req.body[field];
        }
      }
    });

    await publication.save();
    await publication.populate('creator', 'name email university');

    res.json({ success: true, msg: 'Publication updated', data: publication });
  } catch (error) {
    console.error('Update publication error:', error);
    res.status(500).json({ msg: 'Server error while updating publication', error: error.message });
  }
});

// ❌ DELETE PUBLICATION
router.delete('/:id', auth, async (req, res) => {
  const pubId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(pubId)) {
      return res.status(400).json({ msg: 'Invalid publication ID format' });
    }

    const publication = await Publication.findById(pubId);
    if (!publication) return res.status(404).json({ msg: 'Publication not found' });

    if (publication.creator.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this publication' });
    }

    const deleteResult = await Publication.deleteOne({ _id: pubId });
    if (deleteResult.deletedCount === 0) {
      return res.status(500).json({ msg: 'Failed to delete publication' });
    }

    res.json({ success: true, msg: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ msg: 'Server error while deleting publication', error: error.message });
  }
});

module.exports = router;
