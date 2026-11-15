import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('prime_platter_token');
  const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

  socket = io(socketUrl, {
    auth: {
      token: token ? `Bearer ${token}` : '',
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    // console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    // console.warn('Socket connection error:', err.message);
  });

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
  if (s && orderId) {
    s.emit('join:order', { orderId });
  }
};

export const leaveOrderRoom = (orderId) => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('leave:order', { orderId });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
