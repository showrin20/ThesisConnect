#!/usr/bin/env node

// Simple script to start the server
console.log('🚀 Starting ThesisConnect Backend Server...');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found! Please create one with MONGO_URI and JWT_SECRET');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Check required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in .env file');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📦 Starting server...');

// Start the actual server
require('./server.js');
