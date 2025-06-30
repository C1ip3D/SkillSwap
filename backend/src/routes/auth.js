import express from 'express';
import { register, login, getProfile, forgotPassword } from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/profile', auth, getProfile);

export default router;
