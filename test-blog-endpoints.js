#!/usr/bin/env node

/**
 * Blog API Endpoint Test Script
 * Tests all blog endpoints to ensure they work correctly with authentication
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your server URL
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with a valid JWT token

// Test data
const testBlog = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content with markdown support.',
  excerpt: 'A brief excerpt of the test blog post.',
  category: 'Technology',
  tags: ['test', 'api', 'blog'],
  status: 'draft'
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}/blogs${endpoint}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'x-auth-token': TEST_TOKEN,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test functions
const testEndpoints = async () => {
  console.log('🧪 Starting Blog API Endpoint Tests...\n');

  // Test 1: Get all blogs
  console.log('📋 Test 1: GET /blogs (Get all blogs)');
  const allBlogs = await makeRequest('GET', '');
  console.log(`Status: ${allBlogs.status}`, allBlogs.success ? '✅' : '❌');
  console.log('Response:', JSON.stringify(allBlogs, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Get user's blogs (requires auth)
  console.log('👤 Test 2: GET /blogs/my-blogs (Get user blogs - requires auth)');
  const myBlogs = await makeRequest('GET', '/my-blogs');
  console.log(`Status: ${myBlogs.status}`, myBlogs.success ? '✅' : '❌');
  console.log('Response:', JSON.stringify(myBlogs, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Create a blog (requires auth)
  console.log('➕ Test 3: POST /blogs (Create blog - requires auth)');
  const createBlog = await makeRequest('POST', '', testBlog);
  console.log(`Status: ${createBlog.status}`, createBlog.success ? '✅' : '❌');
  console.log('Response:', JSON.stringify(createBlog, null, 2));
  
  let createdBlogId = null;
  if (createBlog.success && createBlog.data?.data?._id) {
    createdBlogId = createBlog.data.data._id;
    console.log(`📝 Created blog ID: ${createdBlogId}`);
  }
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Get specific blog
  if (createdBlogId) {
    console.log(`🔍 Test 4: GET /blogs/${createdBlogId} (Get specific blog)`);
    const specificBlog = await makeRequest('GET', `/${createdBlogId}`);
    console.log(`Status: ${specificBlog.status}`, specificBlog.success ? '✅' : '❌');
    console.log('Response:', JSON.stringify(specificBlog, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Update blog (requires auth + ownership)
    console.log(`✏️ Test 5: PUT /blogs/${createdBlogId} (Update blog - requires auth + ownership)`);
    const updateData = { ...testBlog, title: 'Updated Test Blog Post' };
    const updateBlog = await makeRequest('PUT', `/${createdBlogId}`, updateData);
    console.log(`Status: ${updateBlog.status}`, updateBlog.success ? '✅' : '❌');
    console.log('Response:', JSON.stringify(updateBlog, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 6: Like blog
    console.log(`❤️ Test 6: PATCH /blogs/${createdBlogId}/like (Like blog)`);
    const likeBlog = await makeRequest('PATCH', `/${createdBlogId}/like`);
    console.log(`Status: ${likeBlog.status}`, likeBlog.success ? '✅' : '❌');
    console.log('Response:', JSON.stringify(likeBlog, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 7: View blog
    console.log(`👀 Test 7: PATCH /blogs/${createdBlogId}/view (View blog)`);
    const viewBlog = await makeRequest('PATCH', `/${createdBlogId}/view`);
    console.log(`Status: ${viewBlog.status}`, viewBlog.success ? '✅' : '❌');
    console.log('Response:', JSON.stringify(viewBlog, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 8: Add comment
    console.log(`💬 Test 8: POST /blogs/${createdBlogId}/comment (Add comment)`);
    const commentData = { user: 'Test User', text: 'This is a test comment!' };
    const addComment = await makeRequest('POST', `/${createdBlogId}/comment`, commentData);
    console.log(`Status: ${addComment.status}`, addComment.success ? '✅' : '❌');
    console.log('Response:', JSON.stringify(addComment, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 9: Delete blog (requires auth + ownership)
    console.log(`🗑️ Test 9: DELETE /blogs/${createdBlogId} (Delete blog - requires auth + ownership)`);
    const deleteBlog = await makeRequest('DELETE', `/${createdBlogId}`);
    console.log(`Status: ${deleteBlog.status}`, deleteBlog.success ? '✅' : '❌');
    console.log('Response:', JSON.stringify(deleteBlog, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');
  } else {
    console.log('⚠️ Skipping tests 4-9 because blog creation failed');
  }

  // Test 10: Test invalid ObjectId
  console.log('🚫 Test 10: GET /blogs/invalid-id (Invalid ObjectId test)');
  const invalidId = await makeRequest('GET', '/invalid-id');
  console.log(`Status: ${invalidId.status}`, invalidId.status === 400 ? '✅' : '❌');
  console.log('Response:', JSON.stringify(invalidId, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 11: Test authentication error
  console.log('🔒 Test 11: GET /blogs/my-blogs (No auth token)');
  const noAuth = await axios.get(`${API_BASE_URL}/blogs/my-blogs`).catch(err => ({
    success: false,
    error: err.response?.data || err.message,
    status: err.response?.status || 500
  }));
  console.log(`Status: ${noAuth.status}`, noAuth.status === 401 ? '✅' : '❌');
  console.log('Response:', JSON.stringify(noAuth, null, 2));

  console.log('\n🏁 Blog API Tests Completed!');
  console.log('\n📝 Test Summary:');
  console.log('- Make sure your backend server is running');
  console.log('- Replace TEST_TOKEN with a valid JWT token');
  console.log('- Check the API_BASE_URL configuration');
  console.log('- All authentication-required endpoints should return 401 without proper token');
  console.log('- ObjectId validation should return 400 for invalid IDs');
  console.log('- CRUD operations should work properly with authentication');
};

// Run tests
if (require.main === module) {
  if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️ Please update the TEST_TOKEN in the script with a valid JWT token');
    console.log('You can get a token by logging in to your app and checking localStorage or browser dev tools');
    process.exit(1);
  }
  
  testEndpoints().catch(console.error);
}

module.exports = { testEndpoints, makeRequest };
