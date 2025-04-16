import express from 'express';
import {
  getAllLeaderboards,
  getLeaderboardById,
  createLeaderboard,
  getUserLeaderboardPositions
} from '../controllers/leaderboardController.js';
import { protect, active } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllLeaderboards);
router.get('/:id', getLeaderboardById);

// Protected routes
router.post('/', protect, createLeaderboard);
router.get('/user/me', protect, getUserLeaderboardPositions);

export default router;