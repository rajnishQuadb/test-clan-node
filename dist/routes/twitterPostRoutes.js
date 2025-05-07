"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const express_1 = require("express");
const twitterPostController_1 = require("../controllers/twitterPostController");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage(); // Stores file in memory as buffer
exports.upload = (0, multer_1.default)({ storage });
const router = (0, express_1.Router)();
router.post('/Post-tweet', exports.upload.single('media'), twitterPostController_1.PostTweet);
exports.default = router;
//# sourceMappingURL=twitterPostRoutes.js.map