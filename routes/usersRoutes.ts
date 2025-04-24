import express from 'express';
import { socialAuth } from '../controllers/userController';

const router = express.Router();

// Public routes
router.post('/social-auth', socialAuth);

export default router;