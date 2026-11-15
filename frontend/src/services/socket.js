import { io } from 'socket.io-client';

let socket = null;

// Determine socket server endpoint cleanly
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL && typeof import.meta.env.VITE_SOCKET_URL === 'string') {
    return import.meta.env.VITE_SOCKET_URL.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL && typeof import.meta.env.VITE_API_URL === 'string') {
    // Strip trailing /api or / from API URL to get the server root
    return import.meta.env.VITE_API_URL.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  return window.location.origin;
};

export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('prime_platter_token');
  const socketUrl = getSocketUrl();

  try {
    socket = io(socketUrl, {
      auth: {
        token: token ? `Bearer ${token}` : '',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 5000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      // Socket connected successfully
    });

    socket.on('connect_error', () => {
      // Gracefully silent: in serverless environments (like Vercel functions),
      // WebSockets are not persistent; polling fallbacks take over.
    });
  } catch (err) {
    // Suppress unhandled socket initialization exceptions
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && s.connected && orderId) {
    s.emit('join:order', { orderId });
  }
};

export const leaveOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && s.connected && orderId) {
    s.emit('leave:order', { orderId });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    try {
      socket.disconnect();
    } catch (_) {}
    socket = null;
  }
};
