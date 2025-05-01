"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const twitterAuthController_1 = require("../controllers/twitterAuthController");
const router = (0, express_1.Router)();
// Route to initiate Twitter OAuth flow
router.get('/twitter', twitterAuthController_1.twitterLogin);
// Callback route for Twitter OAuth
router.get('/twitter/callback', twitterAuthController_1.twitterCallback);
// Refresh Twitter token
router.post('/twitter/refresh', twitterAuthController_1.refreshTwitterToken);
// Test route - only available in development
router.post('/twitter/test', twitterAuthController_1.twitterTestAuth);
exports.default = router;
//# sourceMappingURL=twitterAuthRoutes.js.map