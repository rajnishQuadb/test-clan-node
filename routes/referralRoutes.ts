import { Router } from 'express';
import referralController from '../controllers/referralController';
import { RequestHandler } from 'express';

const router = Router();

// Get user's referral code and link
router.get('/generate_referral_code', referralController.getReferralCode as RequestHandler);

// Get referral statistics
router.get('/get_referral_stats', referralController.getReferralStats as RequestHandler);

// Update referral record when a user uses a referral codes
router.post('/join_referral', referralController.useReferralCode as RequestHandler);


export default router; 