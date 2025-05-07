import { Router } from 'express';
import { 
  Create_Campaign, 
  Join_Campaign, 
  Get_Single_Campaign, 
  Get_All_Campaigns, 
  Get_Filtered_Campaigns,
  Update_Leaderboard_Points
} from '../controllers/campaignController';

const router = Router();

// Route to create a new campaign
router.post('/create', Create_Campaign);

// Route to join a campaign
router.post('/join', Join_Campaign);

// Route to get all campaigns
router.get('/fetch/all', Get_All_Campaigns);


// Route to get filtered campaigns
router.post('/fetch/filter', Get_Filtered_Campaigns);

// Route to get a single campaign by ID
router.get('/fetch/:id', Get_Single_Campaign);

// Route to update leaderboard points
router.post('/leaderboard/update', Update_Leaderboard_Points);

export default router;