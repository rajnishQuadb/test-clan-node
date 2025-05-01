import { Router } from 'express';
import { 
  twitterLogin, 
  twitterCallback, 
  twitterTestAuth,
  refreshTwitterToken,
} from '../controllers/twitterAuthController';
import  {protect}  from '../middleware/auth';

const router = Router();

// Route to initiate Twitter OAuth flow
router.get('/twitter', twitterLogin);

// Callback route for Twitter OAuth
router.get('/twitter/callback', twitterCallback);

// Refresh Twitter token
router.post('/twitter/refresh', refreshTwitterToken);

// Test route - only available in development
router.post('/twitter/test', twitterTestAuth);




export default router;