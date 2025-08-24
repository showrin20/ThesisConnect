import axios from '../axios';

const projectService = {
  // Get all projects
  getAllProjects: async () => {
    try {
      const response = await axios.get('/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch projects' };
    }
  },

  // Get my projects (projects created by current user or where user is a collaborator)
  getMyProjects: async () => {
    try {
      const response = await axios.get('/projects/my-projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch your projects' };
    }
  },

  // Get project by ID
  getProjectById: async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch project' };
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await axios.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to create project' };
    }
  },

  // Update a project
  updateProject: async (projectId, projectData) => {
    try {
      const response = await axios.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to update project' };
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const response = await axios.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to delete project' };
    }
  },

  // Toggle project privacy
  toggleProjectPrivacy: async (projectId, isPrivate) => {
    try {
      const response = await axios.patch(`/projects/${projectId}/privacy`, { isPrivate });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to update project privacy settings' };
    }
  },

  // Make a project private
  makeProjectPrivate: async (projectId) => {
    return projectService.toggleProjectPrivacy(projectId, true);
  },
  
  // Make a project public
  makeProjectPublic: async (projectId) => {
    return projectService.toggleProjectPrivacy(projectId, false);
  },

  // Get project reviews
  getProjectReviews: async (projectId) => {
    try {
      const response = await axios.get(`/projects/${projectId}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch project reviews' };
    }
  },
  
  // Add a review to a project
  addReview: async (projectId, reviewData) => {
    try {
      const response = await axios.post(`/projects/${projectId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to add review' };
    }
  }
};

export default projectService;
