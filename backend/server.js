const dns = require('dns');
// Override Node.js DNS resolution to use Google DNS, fixing MongoDB Atlas SRV blocking locally
// dns.setServers(['8.8.8.8', '8.8.4.4']); // REMOVED for Vercel deployment

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config/env');
const initializeSocket = require('./src/sockets');

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = initializeSocket(server);

  // Make io accessible in routes via req.app.get('io')
  app.set('io', io);

  // Start listening
  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/v1/health`);
    console.log(`🔌 Socket.io ready\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully.');
    server.close(() => process.exit(0));
  });
};

startServer();
