"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaignController_1 = require("../controllers/campaignController");
const router = (0, express_1.Router)();
// Route to create a new campaign
router.post('/create', campaignController_1.Create_Campaign);
// Route to join a campaign
router.post('/join', campaignController_1.Join_Campaign);
// Route to get all campaigns
router.get('/fetch/all', campaignController_1.Get_All_Campaigns);
// Route to get campaigns joined by a user
router.get('/fetch/user-joined', campaignController_1.Get_User_Joined_Campaigns);
// Route to get filtered campaigns
router.post('/fetch/filter', campaignController_1.Get_Filtered_Campaigns);
// Route to get a single campaign by ID
router.get('/fetch/:id', campaignController_1.Get_Single_Campaign);
// Route to update leaderboard points
router.post('/leaderboard/update', campaignController_1.Update_Leaderboard_Points);
exports.default = router;
//# sourceMappingURL=campaignRoutes.js.map