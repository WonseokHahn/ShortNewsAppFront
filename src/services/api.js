import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shortnewsappback.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased to 2 minutes for GPT processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[API Interceptor] Request to:', config.url);
    console.log('[API Interceptor] Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Interceptor] Token added to header:', token.substring(0, 20) + '...');
    } else {
      console.log('[API Interceptor] NO TOKEN in localStorage!');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// News API
export const newsAPI = {
  searchNews: (keyword, count = 20, process = true) =>
    api.get(`/news/search`, { params: { keyword, count, process } }),

  getNewsByCategory: (category, count = 20) =>
    api.get(`/news/category`, { params: { category, count } }),

  getTrendingNews: () =>
    api.get(`/news/trending`),

  getStoredNews: (filters = {}) =>
    api.get(`/news/stored`, { params: filters }),

  getSentimentStats: (params = {}) =>
    api.get(`/news/stats/sentiment`, { params }),

  getKeywordStats: (params = {}) =>
    api.get(`/news/stats/keywords`, { params }),
};

// Auth API
export const authAPI = {
  register: (userData) =>
    api.post(`/auth/register`, userData),

  login: (credentials) =>
    api.post(`/auth/login`, credentials),

  getProfile: () =>
    api.get(`/auth/profile`),

  getFavorites: () =>
    api.get(`/auth/favorites`),

  addFavorite: (keyword) =>
    api.post(`/auth/favorites`, { keyword }),

  removeFavorite: (id) =>
    api.delete(`/auth/favorites/${id}`),
};

// Settings API
export const settingsAPI = {
  getUserSettings: () =>
    api.get(`/settings`),

  updateUserSettings: (settings) =>
    api.post(`/settings`, settings),

  trackNewsView: (newsId) =>
    api.post(`/settings/track-view`, { newsId }),

  getUserStats: (params = {}) =>
    api.get(`/settings/stats`, { params }),
};

// Health check
export const healthCheck = () =>
  api.get('/health', { baseURL: API_BASE_URL.replace('/api', '') });

export default api;
