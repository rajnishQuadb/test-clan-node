import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  joinCampaign,
  addPoints,
  getLeaderboard,
} from '../controllers/campaignController.js';
import { protect, active } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCampaigns);
router.get('/:id', getCampaign);

// Protected routes
router.post('/', protect, createCampaign);
router.put('/:id', protect, updateCampaign);
router.post('/:id/join', protect, active, joinCampaign);
router.post('/:id/points', protect, active, addPoints);
router.get('/:id/leaderboard', getLeaderboard);

export default router;