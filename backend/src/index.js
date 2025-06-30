import 'dotenv/config';
import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import  config  from './config/config.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://skillswap-frontend-kaxy.onrender.com'
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
        ? 'https://skillswap-frontend-kaxy.onrender.com'
        : 'http://localhost:5173',
    credentials: true,
  })
);


// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add after io is created
io.on('connection', (socket) => {
  socket.on('join-room', (room) => {
    socket.join(room);
    // Optionally notify others
    socket.to(room).emit('peer-joined');
  });

  socket.on('offer', ({ offer, room }) => {
    socket.to(room).emit('offer', { offer });
  });

  socket.on('answer', ({ answer, room }) => {
    socket.to(room).emit('answer', { answer });
  });

  socket.on('ice-candidate', ({ candidate, room }) => {
    socket.to(room).emit('ice-candidate', { candidate });
  });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
