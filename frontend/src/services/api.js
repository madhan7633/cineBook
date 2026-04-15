import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');

      if (tokens?.refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh,
          });
          const newTokens = {
            access: res.data.access,
            refresh: res.data.refresh || tokens.refresh,
          };
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('tokens');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
};

// ─── Movies API ──────────────────────────────────────────
export const moviesAPI = {
  getAll: (params) => api.get('/movies/', { params }),
  getById: (id) => api.get(`/movies/${id}/`),
  getShows: (params) => api.get('/movies/shows/', { params }),
  getSeats: (showId) => api.get('/movies/seats/', { params: { show_id: showId } }),
};

// ─── Bookings API ────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post('/bookings/', data),
  getHistory: () => api.get('/bookings/history/'),
  cancel: (id) => api.patch(`/bookings/${id}/cancel/`),
};

export default api;
