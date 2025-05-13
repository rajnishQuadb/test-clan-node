"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clanController_1 = require("../controllers/clanController");
const router = express_1.default.Router();
router.post('/create', clanController_1.Create_Clan); // Route for creating a clan 
router.get('/fetch/all', clanController_1.Get_All_Clans); // Route for fetching all clans
router.get('/fetch/:clanId', clanController_1.Get_Single_Clan); // Route for fetching a clan by its ID
router.post('/JoinClan', clanController_1.Join_Clan); // Route for joining a clan
router.put('/update/:clanId', clanController_1.Update_Clan); // Route for updating a clan by its ID
router.delete('/delete/:clanId', clanController_1.Delete_Clan); // Route for deleting a clan by its ID
// For testing purposes, you can uncomment the following lines
// router.get('/fetch/:clanId', validateUUID('clanId'), Get_Single_Clan);
// router.post('/join', validateJoinClanRequest, Join_Clan);
exports.default = router;
//# sourceMappingURL=clansRoutes.js.map