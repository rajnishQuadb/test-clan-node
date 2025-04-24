import { Router } from 'express';
import { twitterLogin, twitterCallback, twitterTestAuth } from '../controllers/twitterAuthController';

const router = Router();

// Route to initiate Twitter OAuth flow
router.get('/twitter', twitterLogin);

// Callback route for Twitter OAuth
router.get('/twitter/callback', twitterCallback);

// Test route - only available in development
router.post('/twitter/test', twitterTestAuth);

export default router;