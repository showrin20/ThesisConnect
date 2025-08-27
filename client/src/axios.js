// src/axios.js or src/utils/axios.js
import axios from 'axios';

// Better API URL configuration with environment-aware logic
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://thesisconnect-backend.onrender.com/api' : 'http://localhost:1085/api');

console.log('API connecting to:', API_URL); // Debug logging for connection issues

const instance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000, // Increased timeout for potentially slower production connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to x-auth-token header for consistency with backend
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('API Response Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url
      });
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Request Error: No response received', {
        request: error.request,
        url: error.config?.url
      });
    } else {
      // Something happened in setting up the request
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default instance;
