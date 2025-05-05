import { Router } from 'express';
import referralController from '../controllers/referralController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Get user's referral code and link
router.get('/code', authenticateUser, referralController.getReferralCode);

// Get referral statistics
router.get('/stats', authenticateUser, referralController.getReferralStats);

// Use a referral code
router.post('/use', authenticateUser, referralController.useReferralCode);

export default router; 