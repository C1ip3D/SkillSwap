import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createSkill,
  getSkills,
  getSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skills.js';

const router = express.Router();

// Public routes
router.get('/', getSkills);
router.get('/:id', getSkill);

// Protected routes
router.use(auth);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
