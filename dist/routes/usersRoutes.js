"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Make the create endpoint public for initial user creation
router.post('/create', userController_1.Create_User);
// IMPORTANT: More specific routes first
router.get('/fetch/all', userController_1.Get_All_Users);
router.get('/fetch/filter', auth_1.protect, userController_1.Get_Filtered_Users);
// Then parameter-based routes
// router.get('/fetch/:id', protect, Get_Single_User);
router.get('/fetch/:id', userController_1.Get_Single_User);
// router.put('/update/:id', protect, Update_User);
router.put('/update/:id', userController_1.Update_User);
router.post('/earlyUser', userController_1.Early_User);
exports.default = router;
//# sourceMappingURL=usersRoutes.js.map