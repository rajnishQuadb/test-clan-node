import { Router } from 'express';
import { googleLogin, googleCallback, googleVerify } from '../controllers/googleAuthController';

const router = Router();

// Route to initiate Google OAuth flow
router.get('/google', googleLogin);

// Callback route for Google OAuth
router.get('/google/callback', googleCallback);

// Route to verify Google ID token
router.post('/google/verify', googleVerify);

export default router;