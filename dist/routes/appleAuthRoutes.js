"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appleAuthController_1 = require("../controllers/appleAuthController");
const router = (0, express_1.Router)();
// Route to verify Apple identity token
router.post('/apple/verify', appleAuthController_1.appleVerify);
exports.default = router;
//# sourceMappingURL=appleAuthRoutes.js.map