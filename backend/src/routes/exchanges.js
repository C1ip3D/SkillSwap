import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createExchange,
  getExchanges,
  getExchange,
  updateExchangeStatus,
  rateExchange,
} from '../controllers/exchanges.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Create a new exchange
router.post('/', createExchange);

// Get all exchanges for the authenticated user
router.get('/', getExchanges);

// Get a specific exchange
router.get('/:id', getExchange);

// Update exchange status (teacher only)
router.patch('/:id/status', updateExchangeStatus);

// Rate an exchange (student only)
router.post('/:id/rate', rateExchange);

export default router;
