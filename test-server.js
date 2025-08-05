// 🧪 Quick Server Test
// Run this to test if your server starts without errors

const http = require('http');

async function testServer() {
  console.log('🔧 Testing server startup...\n');
  
  try {
    // Test if server is running
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/api/test', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data
            });
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });

    if (response.status === 200) {
      console.log('✅ Server is running successfully!');
      console.log('📊 Response:', response.data);
    } else {
      console.log('⚠️  Server responded with status:', response.status);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start it with: npm start');
    } else {
      console.log('❌ Error testing server:', error.message);
    }
  }
}

// Test protected routes if server is running
async function testProtectedRoutes() {
  console.log('\n🔐 Testing protected routes (should require authentication)...');
  
  const routes = [
    '/api/protected/test',
    '/api/protected/student-area',
    '/api/protected/mentor-area',
    '/api/protected/admin-area'
  ];

  for (const route of routes) {
    try {
      const response = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:5000${route}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve({
                route,
                status: res.statusCode,
                data: JSON.parse(data)
              });
            } catch (e) {
              resolve({
                route,
                status: res.statusCode,
                data: data
              });
            }
          });
        });
        
        req.on('error', reject);
        req.setTimeout(3000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      if (response.status === 401) {
        console.log(`✅ ${route} - Correctly requires authentication (401)`);
      } else {
        console.log(`⚠️  ${route} - Status: ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ ${route} - Error: ${error.message}`);
    }
  }
}

// Run tests
if (require.main === module) {
  testServer().then(() => {
    return testProtectedRoutes();
  });
}

module.exports = { testServer, testProtectedRoutes };
