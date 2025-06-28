import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createSkill,
  getSkills,
  getSkill,
  updateSkill,
  deleteSkill,
  browseSkills,
} from '../controllers/skills.js';

const router = express.Router();

// Protected routes (all require auth)
router.use(auth);

router.get('/browse', browseSkills);
router.get('/', getSkills);
router.get('/:id', getSkill);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
