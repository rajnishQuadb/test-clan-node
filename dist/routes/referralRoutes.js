"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referralController_1 = __importDefault(require("../controllers/referralController"));
const router = (0, express_1.Router)();
// Get referral statistics
router.get('/get_referral_stats/:userId', referralController_1.default.getReferralStats);
// Update referral record when a user uses a referral codes
router.post('/join_referral', referralController_1.default.useReferralCode);
// Handle referral redirect
// router.get('/redirect/:referralCode', (req, res) => {
//   const { referralCode } = req.params;
//   console.log(`Referral code: ${referralCode}`);
//   // Store referral code in a cookie that expires in 7 days
//   // res.cookie('referral_code', referralCode, {
//   //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//   //   httpOnly: true,
//   //   secure: process.env.NODE_ENV === 'production',
//   //   sameSite: 'lax'
//   // });
//   // Redirect to main page
//   // res.redirect(`https://clans-landing.10on10studios.com/referral/${referralCode}`);
//   res.redirect(`https://clans-landing.10on10studios.com`);
//   // res.send({
//   //   message: 'Referral code stored in cookie',
//   //   referralCode: referralCode,
//   //   redirectUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND}`
//   // })
// });
exports.default = router;
//# sourceMappingURL=referralRoutes.js.map