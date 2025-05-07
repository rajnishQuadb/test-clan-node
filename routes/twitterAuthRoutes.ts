// // Test route - only available in development
// router.post('/twitter/test', twitterTestAuth);

// export default router;

import { Router } from 'express';
import { 
  twitterLoginV2,
  twitterCallbackV2,
  postTweet,
  uploadMedia,
  verifyCredentials
} from '../controllers/twitterAuthController';
import  {protect}  from '../middleware/auth';
import multer from 'multer';


const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Auth routes
router.get('/twitter', twitterLoginV2);
router.get('/twitter/callback', twitterCallbackV2);


// Tweet and media routes
router.post('/twitter/tweet', postTweet);
router.post('/twitter/upload-media/:userId', upload.single('media'), uploadMedia);
router.get('/twitter/verify/:userId', verifyCredentials);



export default router;