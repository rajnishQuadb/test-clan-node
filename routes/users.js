import express from 'express';
import { 
  socialAuth, 
  getUserProfile, 
  updateKiltConnection,
  linkSocialAccount
} from '../controllers/userController.js';
import { protect, active } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/social-auth', socialAuth);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/kilt-connection', protect, updateKiltConnection);
router.post('/link-social', protect, linkSocialAccount);

// You can add more routes below as needed
// For example, routes for updating profile, changing settings, etc.

export default router;