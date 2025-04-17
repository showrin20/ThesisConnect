// src/axios.js or src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001/api', // 🔁 Change this easily for prod
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally add token if you want auto-auth headers:
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
