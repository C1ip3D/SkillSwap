import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import authRoutes from './routes/auth.js';
import skillsRoutes from './routes/skills.js';
import exchangesRoutes from './routes/exchanges.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/skills', skillsRoutes);
app.use('/exchanges', exchangesRoutes);

// Serve static files from the frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Catch-all: send index.html for any route not handled above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

export default app;
