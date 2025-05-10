import express from 'express';
import { Create_Clan, Get_Single_Clan, Get_All_Clans, Join_Clan, Update_Clan, Delete_Clan } from '../controllers/clanController';
import { validateUUID, validateJoinClanRequest } from '../middleware/validation';
const router = express.Router();

router.post('/create', Create_Clan); // Route for creating a clan 

router.get('/fetch/all', Get_All_Clans); // Route for fetching all clans

router.get('/fetch/:clanId', Get_Single_Clan); // Route for fetching a clan by its ID

router.post('/JoinClan', Join_Clan); // Route for joining a clan

router.put('/update/:clanId', Update_Clan); // Route for updating a clan by its ID

router.delete('/delete/:clanId', Delete_Clan); // Route for deleting a clan by its ID

// For testing purposes, you can uncomment the following lines
// router.get('/fetch/:clanId', validateUUID('clanId'), Get_Single_Clan);
// router.post('/join', validateJoinClanRequest, Join_Clan);
export default router;
