import { Router } from 'express';
import {Post_Tweet_Controller} from '../controllers/twitterPostController';

const router = Router();

// Route to initiate Twitter OAuth flow
router.post('/PostTwitter', Post_Tweet_Controller);

export default router;