import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ayantaskbackend-production.up.railway.app/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for attaching the Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. If it's a 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {

      // 2. IMPORTANT: If the request was for /refresh or we are already on /login, 
      // do NOT try to refresh or redirect again (prevents infinite loop)
      if (originalRequest.url.includes('/auth/refresh') || window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const refreshRes = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshRes.data.data;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }

        // Retry original request if refresh succeeded
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails and we aren't on login page, then redirect
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
