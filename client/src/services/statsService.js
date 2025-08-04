import axios from '../axios';

export const statsService = {
  // Get user statistics
  getUserStats: async (userId) => {
    try {
      const response = await axios.get(`/users/stats/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Get dashboard overview stats
  getDashboardStats: async () => {
    try {
      const response = await axios.get('/stats/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default statsService;
