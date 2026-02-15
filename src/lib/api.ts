// src/lib/api.ts

import axios from 'axios';

// Pastikan URL sudah termasuk /api
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://social-media-be-400174736012.asia-southeast2.run.app/api';

console.log('🔧 API Base URL:', baseURL);

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText
    });
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Network Error - Cannot reach server');
    } else if (error.response) {
      console.error('❌ Server responded with error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;