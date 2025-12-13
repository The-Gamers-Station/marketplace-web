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
    uploadImage: '/media/upload',
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

// API request helper with robust error handling and safe JSON parsing
export const apiRequest = async (url, options = {}, isRetry = false) => {
  const response = await fetch(buildApiUrl(url), {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('Content-Type') || '';

  // 204 No Content => return null to avoid JSON parse errors
  if (response.status === 204) {
    return null;
  }

  // Read body once (stream is consumable only once)
  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    bodyText = '';
  }

  // Helper: try to parse JSON safely if content-type indicates JSON and body is not empty
  const tryParseJson = () => {
    if (!contentType.toLowerCase().includes('application/json') || !bodyText) return null;
    try {
      return JSON.parse(bodyText);
    } catch {
      return null;
    }
  };

  // Handle 401/403 - try to refresh token
  if ((response.status === 401 || response.status === 403) && !isRetry) {
    try {
      // Dynamically import authService to avoid circular dependency
      const { authService } = await import('../services/authService.js');
      await authService.refreshToken();
      // Retry the original request with new token
      return apiRequest(url, options, true);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
  }

  if (response.ok) {
    const json = tryParseJson();
    if (json !== null) return json;
    // Fallback: return text or null if empty
    return bodyText || null;
  }

  // Error path: build meaningful message from ProblemDetail (Spring) or raw text
  const errorJson = tryParseJson();
  const message =
    (errorJson && (errorJson.message || errorJson.detail || errorJson.title)) ||
    bodyText ||
    response.statusText ||
    'API request failed';

  throw new Error(`[${response.status}] ${message}`);
};

// File upload helper
export const uploadFile = async (file, folder = 'posts') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(buildApiUrl('/media/upload'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      // Don't set Content-Type - let browser set it with boundary for multipart
    },
    body: formData,
  });

  if ((response.status === 401 || response.status === 403)) {
    try {
      const { authService } = await import('../services/authService.js');
      await authService.refreshToken();
      // Retry upload with new token
      return uploadFile(file, folder);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed: ${error || response.statusText}`);
  }

  return response.json();
};

export default API_BASE_URL;