// import { Router } from 'express';
// import { 
//   twitterLogin, 
//   twitterCallback, 
//   twitterTestAuth,
//   refreshTwitterToken,
// } from '../controllers/twitterAuthController';
// import  {protect}  from '../middleware/auth';

// const router = Router();

// // Route to initiate Twitter OAuth flow
// router.get('/twitter', twitterLogin);

// // Callback route for Twitter OAuth
// router.get('/twitter/callback', twitterCallback);

// // Refresh Twitter token
// router.post('/twitter/refresh', refreshTwitterToken);

// // Test route - only available in development
// router.post('/twitter/test', twitterTestAuth);




// export default router;

import { Router } from 'express';
import multer from 'multer';
import {
  twitterLoginV2,
  twitterCallbackV2,
  postTweet,
  uploadMedia,
  verifyCredentials
} from '../controllers/twitterAuthController';

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