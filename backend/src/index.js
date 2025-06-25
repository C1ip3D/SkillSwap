import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/config.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com'
        : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com'
        : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Add more socket event handlers here
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
