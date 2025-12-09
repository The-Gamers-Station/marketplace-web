// API Configuration
// Use relative URL in development to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    requestOtp: '/auth/otp/request',
    verifyOtp: '/auth/otp/verify',
    refresh: '/auth/refresh',
  },
  
  // Posts/Products
  posts: {
    list: '/posts',
    search: '/posts/search',
    getById: (id) => `/posts/${id}`,
    create: '/posts',
    update: (id) => `/posts/${id}`,
    delete: (id) => `/posts/${id}`,
    myPosts: '/posts/my-ads',
    markAsSold: (id) => `/posts/${id}/mark-sold`,
  },
  
  // Categories
  categories: {
    list: '/categories',
    getById: (id) => `/categories/${id}`,
  },
  
  // Cities
  cities: {
    list: '/cities',
    getById: (id) => `/cities/${id}`,
  },
  
  // Regions
  regions: {
    list: '/regions',
    getById: (id) => `/regions/${id}`,
  },
  
  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    publicProfile: (id) => `/users/${id}/public`,
  },
  
  // Comments
  comments: {
    create: '/comments',
    list: '/comments',
    update: (id) => `/comments/${id}`,
    delete: (id) => `/comments/${id}`,
  },
  
  // Media
  media: {
    uploadImage: '/media/images',
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Default headers
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API request helper
export const apiRequest = async (url, options = {}) => {
  const response = await fetch(buildApiUrl(url), {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
};

export default API_BASE_URL;