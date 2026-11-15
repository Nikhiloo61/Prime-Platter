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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token and guest session header
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

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
export { getOrCreateGuestId };
