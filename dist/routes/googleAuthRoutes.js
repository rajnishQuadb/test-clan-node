"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleAuthController_1 = require("../controllers/googleAuthController");
const router = (0, express_1.Router)();
// Route to initiate Google OAuth flow
router.get('/google', googleAuthController_1.googleLogin);
// Callback route for Google OAuth
router.get('/google/callback', googleAuthController_1.googleCallback);
// Route to verify Google ID token
router.post('/google/verify', googleAuthController_1.googleVerify);
exports.default = router;
//# sourceMappingURL=googleAuthRoutes.js.map