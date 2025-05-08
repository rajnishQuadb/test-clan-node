import { Router } from 'express';
import referralController from '../controllers/referralController';
import { RequestHandler } from 'express';

const router = Router();

// Get referral statistics
router.get('/get_referral_stats/:userId', referralController.getReferralStats as RequestHandler);

// Update referral record when a user uses a referral codes
router.post('/join_referral', referralController.useReferralCode as RequestHandler);

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

export default router;