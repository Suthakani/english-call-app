const { Server } = require('socket.io');

// In-memory online users: userId -> socketId
const onlineUsers = new Map();

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
  socket.on('identify', (userId) => {
  const uid = String(userId);          // ⬅️ ADD THIS LINE
  socket.join(`user:${uid}`);
  socket.data.userId = uid;
  onlineUsers.set(uid, socket.id);      // ⬅️ CHANGE userId → uid
  io.emit('presence:update', { userId: uid, online: true });  // ⬅️ CHANGE userId → uid
});

    socket.on('session:join', (sessionId) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on('session:message', ({ sessionId, message, from }) => {
      socket.to(`session:${sessionId}`).emit('session:message', { message, from, at: Date.now() });
    });

    socket.on('webrtc:offer', ({ sessionId, offer }) => {
      socket.to(`session:${sessionId}`).emit('webrtc:offer', { offer });
    });
    socket.on('webrtc:answer', ({ sessionId, answer }) => {
      socket.to(`session:${sessionId}`).emit('webrtc:answer', { answer });
    });
    socket.on('webrtc:ice-candidate', ({ sessionId, candidate }) => {
      socket.to(`session:${sessionId}`).emit('webrtc:ice-candidate', { candidate });
    });

    socket.on('session:leave', (sessionId) => {
      socket.to(`session:${sessionId}`).emit('session:peer-left');
      socket.leave(`session:${sessionId}`);
    });

  socket.on('disconnect', () => {
  const userId = socket.data.userId;   // already string now, no change needed
  if (userId && onlineUsers.get(userId) === socket.id) {
    onlineUsers.delete(userId);
    io.emit('presence:update', { userId, online: false });
  }
});
  });

  return io;
}

function isOnline(userId) {
  return onlineUsers.has(String(userId));
}

function getOnlineUserIds() {
  return [...onlineUsers.keys()];
}

module.exports = { initSocket, isOnline, getOnlineUserIds };