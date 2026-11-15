import axios from 'axios';

// Ensure a persistent unique guest ID for unauthenticated sessions
const getOrCreateGuestId = () => {
  let guestId = localStorage.getItem('prime_platter_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('prime_platter_guest_id', guestId);
  }
  return guestId;
};

// Normalize base URL: strip trailing slashes, default to Vite dev proxy /api
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and persistent guest cart session header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prime_platter_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach persistent guest cart header
    config.headers['x-cart-id'] = getOrCreateGuestId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction and expired session handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired or invalid session tokens (HTTP 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('prime_platter_token');
      if (hadToken) {
        localStorage.removeItem('prime_platter_token');
        localStorage.removeItem('prime_platter_user');
        window.dispatchEvent(new CustomEvent('prime_platter_auth_expired'));
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
export { getOrCreateGuestId, getBaseUrl };
