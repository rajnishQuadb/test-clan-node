"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discordAuthController_1 = require("../controllers/discordAuthController");
const router = (0, express_1.Router)();
router.get("/discord", discordAuthController_1.discordLogin);
router.get("/discord/callback", discordAuthController_1.discordCallback); // This should be the actual callback handler
exports.default = router;
//# sourceMappingURL=discordAuthRoutes.js.map