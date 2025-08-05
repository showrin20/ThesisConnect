// 🧪 Test Suite for Role-Based Authentication
// Run this with: node test-auth.js

const axios = require('axios');
const API_BASE = 'http://localhost:5000/api'; // Adjust your port

async function testAuthentication() {
  console.log('🔐 Testing Role-Based Authentication System\n');

  // Test data
  const testUsers = [
    {
      name: 'John Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    },
    {
      name: 'Jane Mentor',
      email: 'mentor@test.com',
      password: 'password123',
      role: 'mentor'
    },
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    }
  ];

  try {
    // 1. Register test users
    console.log('📝 Registering test users...');
    const tokens = {};
    
    for (const user of testUsers) {
      try {
        const response = await axios.post(`${API_BASE}/auth/register`, user);
        if (response.data.success) {
          tokens[user.role] = response.data.token;
          console.log(`✅ ${user.role} registered successfully`);
          console.log(`   Role in response: ${response.data.user.role}`);
        }
      } catch (error) {
        console.log(`⚠️  ${user.role} registration failed:`, error.response?.data?.msg || error.message);
      }
    }

    console.log('\n🔑 Testing protected routes...\n');

    // 2. Test student access
    if (tokens.student) {
      console.log('👨‍🎓 Testing STUDENT access:');
      await testRouteAccess(tokens.student, 'student', [
        '/protected/student-area',
        '/protected/mentor-area',
        '/protected/admin-area'
      ]);
    }

    // 3. Test mentor access
    if (tokens.mentor) {
      console.log('\n👨‍🏫 Testing MENTOR access:');
      await testRouteAccess(tokens.mentor, 'mentor', [
        '/protected/student-area',
        '/protected/mentor-area',
        '/protected/admin-area'
      ]);
    }

    // 4. Test admin access
    if (tokens.admin) {
      console.log('\n👑 Testing ADMIN access:');
      await testRouteAccess(tokens.admin, 'admin', [
        '/protected/student-area',
        '/protected/mentor-area',
        '/protected/admin-area'
      ]);
    }

    // 5. Test role management (admin only)
    if (tokens.admin && tokens.student) {
      console.log('\n🔧 Testing role management...');
      await testRoleManagement(tokens.admin, tokens.student);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testRouteAccess(token, userRole, routes) {
  for (const route of routes) {
    try {
      const response = await axios.get(`${API_BASE}${route}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        console.log(`  ✅ ${route} - ${response.data.msg}`);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.msg || error.message;
      
      if (status === 403) {
        console.log(`  🚫 ${route} - Access denied (expected for ${userRole})`);
      } else {
        console.log(`  ❌ ${route} - Error: ${message}`);
      }
    }
  }
}

async function testRoleManagement(adminToken, studentToken) {
  try {
    // Get user list
    const usersResponse = await axios.get(`${API_BASE}/protected/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (usersResponse.data.success) {
      console.log('  ✅ Admin can access user list');
      
      // Find a student user to promote
      const studentUser = usersResponse.data.users.find(u => u.role === 'student');
      
      if (studentUser) {
        // Try to promote student to mentor
        const updateResponse = await axios.patch(
          `${API_BASE}/protected/users/${studentUser.id}/role`,
          { role: 'mentor' },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        
        if (updateResponse.data.success) {
          console.log('  ✅ Admin can update user roles');
          console.log(`     Updated ${studentUser.name} from student to mentor`);
        }
      }
    }
  } catch (error) {
    console.log('  ❌ Role management test failed:', error.response?.data?.msg || error.message);
  }
}

// Run tests
if (require.main === module) {
  testAuthentication();
}

module.exports = { testAuthentication };
