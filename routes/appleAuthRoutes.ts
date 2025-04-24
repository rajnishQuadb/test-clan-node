import { Router } from 'express';
import { appleVerify } from '../controllers/appleAuthController';

const router = Router();

// Route to verify Apple identity token
router.post('/apple/verify', appleVerify);

export default router;