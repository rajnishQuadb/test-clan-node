import { Referral } from '../models/Referral';
import { User } from '../models/User';
import UserRewardHistory from '../models/UserRewardHistory';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

const REFERRAL_REWARD_POINTS = 100;
const REFERRAL_CAMPAIGN_ID = 'REFERRAL_REWARD_CAMPAIGN';

class ReferralService {
  // Create referral -markreferal as completed
  async createReferral(referralCode: string, referredUserId: string) {
    try {
      const referrer = await User.findOne({
        where: {
          referralCode,
          isActiveUser: true,
        },
      });

      if (!referrer) {
        throw new AppError('Invalid referral code', HTTP_STATUS.BAD_REQUEST);
      }

      if (referrer.userId === referredUserId) {
        throw new AppError('Cannot use your own referral code', HTTP_STATUS.BAD_REQUEST);
      }

      const existingReferral = await Referral.findOne({
        where: { referredUserId },
      });

      if (existingReferral) {
        throw new AppError('User already has a referrer', HTTP_STATUS.BAD_REQUEST);
      }

      const referral = await Referral.create({
        referrerUserId: referrer.userId,
        referredUserId,
        referralCode,
        joinedAt: new Date(),
        rewardGiven: false,
      });

      return referral;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to create referral', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Process reward
  async processReferralReward(referralId: string) {
    try {
      const referral = await Referral.findOne({
        where: { referralId },
        include: [
          {
            model: User,
            as: 'referrer',
            attributes: ['userId'],
          },
        ],
      });

      if (!referral) {
        throw new AppError('Referral not found', HTTP_STATUS.NOT_FOUND);
      }

      if (referral.rewardGiven) {
        return;
      }

      await UserRewardHistory.create({
        userId: referral.referrerUserId,
        campaignId: REFERRAL_CAMPAIGN_ID,
        reward: REFERRAL_REWARD_POINTS,
        rewardDate: new Date(),
      });

      await referral.update({ rewardGiven: true });

      return referral;
    } catch (error) {
      console.error('Error processing referral reward:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to process reward', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get stats
  async getReferralStats(userId: string) {
    try {
      const referrals = await Referral.findAll({
        where: { referrerUserId: userId },
        include: [
          {
            model: User,
            as: 'referred',
            attributes: ['createdAt'],
          },
        ],
        order: [['joinedAt', 'DESC']],
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
          joinedAt: r.joinedAt,
          rewardGiven: r.rewardGiven,
          tweetId: r.tweetId ?? null,
        })),
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to fetch stats', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  // Get referral code and link
  async getReferralCode(userId: string) {
    try {
      const user = await User.findOne({
        where: { userId },
        attributes: ['referralCode'],
      });

      if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
      }

      return {
        referralCode: user.referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND}/referral/${user.referralCode}`,
      };
    } catch (error) {
      console.error('Error getting referral code:', error);
      throw error instanceof AppError
        ? error
        : new AppError('Failed to fetch referral code', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}

export default new ReferralService();
