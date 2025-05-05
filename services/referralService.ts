import { Referral } from '../models/Referral';
import { User } from '../models/User';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import UserRewardHistory from '../models/UserRewardHistory';

// Constants for referral rewards
const REFERRAL_REWARD_POINTS = 100;
const REFERRAL_CAMPAIGN_ID = 'REFERRAL_REWARD_CAMPAIGN';

class ReferralService {
  // Create a new referral when someone uses a referral code
  async createReferral(referralCode: string, referredUserId: string) {
    try {
      // Find the referrer by their referral code
      const referrer = await User.findOne({ 
        where: { 
          referralCode,
          isActiveUser: true 
        }
      });

      if (!referrer) {
        throw new AppError('Invalid referral code', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if user is trying to use their own referral code
      if (referrer.userId === referredUserId) {
        throw new AppError('Cannot use your own referral code', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if this user was already referred
      const existingReferral = await Referral.findOne({
        where: { referredUserId }
      });

      if (existingReferral) {
        throw new AppError('User already has a referrer', HTTP_STATUS.BAD_REQUEST);
      }

      // Create the referral record
      const referral = await Referral.create({
        referrerUserId: referrer.userId,
        referredUserId,
        referralCode,
        joinedAt: new Date(),
        rewardGiven: false
      });

      return referral;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating referral:', error);
      throw new AppError('Failed to create referral', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Process reward when referred user completes required action (e.g., posts tweet)
  async processReferralReward(referralId: string) {
    try {
      const referral = await Referral.findOne({
        where: { referralId },
        include: [{
          model: User,
          as: 'referrer',
          attributes: ['userId']
        }]
      });

      if (!referral) {
        throw new AppError('Referral not found', HTTP_STATUS.NOT_FOUND);
      }

      // Check if reward was already given
      if (referral.rewardGiven) {
        return;
      }

      // Create reward history entry
      await UserRewardHistory.create({
        userId: referral.referrerUserId,
        campaignId: REFERRAL_CAMPAIGN_ID,
        reward: REFERRAL_REWARD_POINTS,
        rewardDate: new Date()
      });

      // Mark referral as rewarded
      await referral.update({ rewardGiven: true });

      return referral;
    } catch (error) {
      console.error('Error processing referral reward:', error);
      throw error;
    }
  }

  // Get referral statistics for a user
  async getReferralStats(userId: string) {
    try {
      const referrals = await Referral.findAll({
        where: { referrerUserId: userId },
        include: [{
          model: User,
          as: 'referred',
          attributes: ['web3UserName', 'createdAt']
        }]
      });

      const totalReferrals = referrals.length;
      const successfulReferrals = referrals.filter(r => r.rewardGiven).length;
      const pendingReferrals = totalReferrals - successfulReferrals;

      return {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        totalRewards: successfulReferrals * REFERRAL_REWARD_POINTS,
        pendingRewards: pendingReferrals * REFERRAL_REWARD_POINTS,
        referrals: referrals.map(r => ({
          referredUser: r.referred?.web3UserName,
          joinedAt: r.joinedAt,
          rewardGiven: r.rewardGiven,
          tweetId: r.tweetId
        }))
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  // Get user's referral code
  async getReferralCode(userId: string) {
    try {
      const user = await User.findOne({
        where: { userId },
        attributes: ['referralCode']
      });

      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      return {
        referralCode: user.referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND}/referral/${user.referralCode}`
      };
    } catch (error) {
      console.error('Error getting referral code:', error);
      throw error;
    }
  }
}

export default new ReferralService(); 