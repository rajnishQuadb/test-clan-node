"use strict";
// // Test route - only available in development
// router.post('/twitter/test', twitterTestAuth);
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// export default router;
const express_1 = require("express");
const twitterAuthController_1 = require("../controllers/twitterAuthController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Auth routes
router.get('/twitter', twitterAuthController_1.twitterLoginV2);
router.get('/twitter/callback', twitterAuthController_1.twitterCallbackV2);
// Tweet and media routes
router.post('/twitter/tweet', twitterAuthController_1.postTweet);
router.post('/twitter/upload-media/:userId', upload.single('media'), twitterAuthController_1.uploadMedia);
router.get('/twitter/verify/:userId', twitterAuthController_1.verifyCredentials);
exports.default = router;
//# sourceMappingURL=twitterAuthRoutes.js.map