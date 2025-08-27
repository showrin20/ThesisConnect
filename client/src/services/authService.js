import axios from '../axios';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Login failed' };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Registration failed' };
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call the server-side logout endpoint
      const response = await axios.post('/auth/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      return response.data;
    } catch (error) {
      // Even if server call fails, remove the token locally
      localStorage.removeItem('token');
      throw error.response?.data || { msg: 'Logout failed' };
    }
  },

  // Get current user (if token exists)
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decode JWT to get user info (basic decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return null;
      }
      
      return payload;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getCurrentUser();
  },

  // Request password reset
  forgotPassword: async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Password reset request failed' };
    }
  },

  // Reset password with token
  resetPassword: async (resetToken, password) => {
    try {
      const response = await axios.post('/auth/reset-password', { resetToken, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Password reset failed' };
    }
  }
};

export default authService;
