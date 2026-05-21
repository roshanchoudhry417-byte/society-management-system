const { Server } = require('socket.io');
const config = require('../config/env');

/**
 * Initialize Socket.io server.
 * Rooms:
 *   - `admin` — admin users join this room
 *   - `flat:<flatNumber>` — residents join their flat room
 *   - `user:<userId>` — individual user room
 *
 * Events emitted from controllers:
 *   - `notice:new` — broadcast to all
 *   - `complaint:new` — to admin room
 *   - `complaint:update` — to specific user
 *   - `visitor:arrival` — to flat room
 *   - `visitor:approved` — to flat room
 *   - `poll:new` — broadcast to all
 */
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client sends their user info to join appropriate rooms
    socket.on('join', (data) => {
      if (data.role === 'admin') {
        socket.join('admin');
        console.log(`👤 Admin joined room: admin`);
      }

      if (data.flatNumber) {
        socket.join(`flat:${data.flatNumber}`);
        console.log(`🏠 User joined room: flat:${data.flatNumber}`);
      }

      if (data.userId) {
        socket.join(`user:${data.userId}`);
        console.log(`👤 User joined room: user:${data.userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
