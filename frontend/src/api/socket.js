import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const token = useAuthStore.getState().token;
    socket = io('/', {
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
