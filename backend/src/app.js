import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import authRoutes from './routes/auth.js';
import skillsRoutes from './routes/skills.js';
import exchangesRoutes from './routes/exchanges.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/skills', skillsRoutes);
app.use('/exchanges', exchangesRoutes);

export default app;
