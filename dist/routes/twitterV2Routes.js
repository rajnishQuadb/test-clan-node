"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const twitterV2AuthController_1 = require("../controllers/twitterV2AuthController");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
// Auth routes
router.get('/twitter', twitterV2AuthController_1.twitterLoginV2);
router.get('/twitter/callback', twitterV2AuthController_1.twitterCallbackV2);
// Tweet and media routes
router.post('/twitter/tweet', twitterV2AuthController_1.postTweet);
router.post('/twitter/upload-media/:userId', upload.single('media'), twitterV2AuthController_1.uploadMedia);
router.get('/twitter/verify/:userId', twitterV2AuthController_1.verifyCredentials);
exports.default = router;
//# sourceMappingURL=twitterV2Routes.js.map