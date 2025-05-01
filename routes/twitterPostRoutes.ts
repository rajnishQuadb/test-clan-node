import { Router } from 'express';
import { 
    PostTweet
} from '../controllers/twitterPostController';
import multer from 'multer';

const storage = multer.memoryStorage(); // Stores file in memory as buffer

export const upload = multer({ storage });

const router = Router();

router.post('/Post-tweet',upload.single('media'), PostTweet);



export default router;
