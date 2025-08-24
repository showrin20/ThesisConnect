#!/usr/bin/env node

/**
 * This is a simple CLI script to make a project private or public
 * Usage: node make-project-private.js <projectId> [true|false]
 * 
 * Examples:
 *   node make-project-private.js 60d0fe4f5311236168a109ca true     # Make project private
 *   node make-project-private.js 60d0fe4f5311236168a109ca false    # Make project public
 *   node make-project-private.js 60d0fe4f5311236168a109ca          # Make project private (default)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB connection URI not found in environment variables');
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function makeProjectPrivate(projectId, isPrivate = true) {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.isPrivate = isPrivate;
    await project.save();

    console.log(`Project "${project.title}" is now ${isPrivate ? 'private' : 'public'}`);
    return project;
  } catch (error) {
    console.error('Error updating project privacy:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Execute if run directly
if (require.main === module) {
  (async () => {
    try {
      const projectId = process.argv[2];
      if (!projectId) {
        console.error('Error: Please provide a project ID');
        console.log('Usage: node make-project-private.js <projectId> [true|false]');
        process.exit(1);
      }

      const isPrivateArg = process.argv[3];
      const isPrivate = isPrivateArg ? isPrivateArg.toLowerCase() === 'true' : true;

      await connectDB();
      await makeProjectPrivate(projectId, isPrivate);
      process.exit(0);
    } catch (error) {
      process.exit(1);
    }
  })();
}

module.exports = makeProjectPrivate;
