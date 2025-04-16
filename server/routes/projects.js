const express = require('express');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.post('/', auth, async (req, res) => {
  const { title, description, tags } = req.body;
  const project = new Project({
    title,
    description,
    tags,
    creator: req.user.id,
  });
  await project.save();
  res.json(project);
});

router.get('/', async (req, res) => {
  const projects = await Project.find().populate('creator', 'name');
  res.json(projects);
});

router.get('/my-projects', auth, async (req, res) => {
  const projects = await Project.find({ creator: req.user.id }).populate('creator', 'name');
  res.json(projects);
});

module.exports = router;