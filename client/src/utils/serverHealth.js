import axios from '../axios';

// Test server connection
export const testServerConnection = async () => {
  try {
    const response = await axios.get('/test');
    console.log('✅ Server connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Server connection failed:', error);
    
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return { 
        success: false, 
        error: 'Cannot connect to server. Please ensure the backend server is running on http://localhost:1085' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || 'Server error' 
    };
  }
};

// Test specific API endpoints
export const testApiEndpoints = async () => {
  const results = {};
  
  // Test auth/me endpoint (requires token)
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await axios.get('/auth/me');
      results.authMe = { success: true, data: response.data };
    } else {
      results.authMe = { success: false, error: 'No token found' };
    }
  } catch (error) {
    results.authMe = { 
      success: false, 
      error: error.response?.data?.msg || error.message 
    };
  }
  
  // Test projects endpoint
  try {
    const response = await axios.get('/projects');
    results.projects = { success: true, data: response.data };
  } catch (error) {
    results.projects = { 
      success: false, 
      error: error.response?.data?.msg || error.message 
    };
  }
  
  return results;
};
