import express from 'express';
import { 
  Create_User,
  Update_User,
  Get_Single_User,
  Get_All_Users,
  Get_Filtered_Users,
  Early_User
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Make the create endpoint public for initial user creation
router.post('/create', Create_User);

// IMPORTANT: More specific routes first
router.get('/fetch/all', protect, Get_All_Users);
router.get('/fetch/filter', protect, Get_Filtered_Users);

// Then parameter-based routes
// router.get('/fetch/:id', protect, Get_Single_User);
router.get('/fetch/:id', Get_Single_User);
// router.put('/update/:id', protect, Update_User);
router.put('/update/:id', Update_User);

router.patch('/:userId/early-user', Early_User);

export default router;