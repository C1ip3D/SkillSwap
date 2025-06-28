import axios from 'axios';
import { useAuth } from '../hooks/useAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuth.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const skills = {
  list: async () => {
    const response = await api.get('/skills');
    return response.data;
  },
  browse: async () => {
    const response = await api.get('/skills/browse');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/skills', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/skills/${id}`);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/skills/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  },
};

export const exchanges = {
  list: async () => {
    const response = await api.get('/exchanges');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/exchanges', data);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/exchanges/${id}`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/exchanges/${id}/status`, { status });
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/exchanges/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/exchanges/${id}`);
    return response.data;
  },
};

export default api;
