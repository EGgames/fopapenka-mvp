const { Server } = require('socket.io');
const { verifyToken } = require('../middlewares/auth');
const chatController = require('../controllers/chat.controller');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token requerido'));
    try {
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    const { pencaId } = socket.user;
    socket.join(`penca:${pencaId}`);

    socket.on('chat:send', async (data) => {
      try {
        const message = await chatController.saveMessage({
          pencaId,
          userId: socket.user.userId,
          content: data.content,
        });
        io.to(`penca:${pencaId}`).emit('chat:message', message);
      } catch (err) {
        socket.emit('chat:error', { error: err.message });
      }
    });

    socket.on('disconnect', () => {});
  });
};

const getIo = () => {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
};

module.exports = { initSocket, getIo };
