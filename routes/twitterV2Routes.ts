import { Router } from 'express';
import multer from 'multer';
import {
  twitterLoginV2,
  twitterCallbackV2,
  postTweet,
  uploadMedia,
  verifyCredentials
} from '../controllers/twitterV2AuthController';

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