"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Referral_1 = require("../models/Referral");
const User_1 = require("../models/User");
const UserRewardHistory_1 = __importDefault(require("../models/UserRewardHistory"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const REFERRAL_REWARD_POINTS = 100;
const REFERRAL_CAMPAIGN_ID = 'REFERRAL_REWARD_CAMPAIGN';
class ReferralService {
    // Create referral -markreferal as completed
    async createReferral(referralCode, referredUserId) {
        try {
            const referrer = await User_1.User.findOne({
                where: {
                    referralCode,
                    isActiveUser: true,
                },
            });
            if (!referrer) {
                throw new error_handler_1.AppError('Invalid referral code', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (referrer.userId === referredUserId) {
                throw new error_handler_1.AppError('Cannot use your own referral code', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const existingReferral = await Referral_1.Referral.findOne({
                where: { referredUserId },
            });
            if (existingReferral) {
                throw new error_handler_1.AppError('User already has a referrer', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const referral = await Referral_1.Referral.create({
                referrerUserId: referrer.userId,
                referredUserId,
                referralCode,
                joinedAt: new Date(),
                rewardGiven: false,
            });
            return referral;
        }
        catch (error) {
            console.error('Error creating referral:', error);
            throw error instanceof error_handler_1.AppError
                ? error
                : new error_handler_1.AppError('Failed to create referral', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Process reward
    async processReferralReward(referralId) {
        try {
            const referral = await Referral_1.Referral.findOne({
                where: { referralId },
                include: [
                    {
                        model: User_1.User,
                        as: 'referrer',
                        attributes: ['userId'],
                    },
                ],
            });
            if (!referral) {
                throw new error_handler_1.AppError('Referral not found', http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            if (referral.rewardGiven) {
                return;
            }
            await UserRewardHistory_1.default.create({
                userId: referral.referrerUserId,
                campaignId: REFERRAL_CAMPAIGN_ID,
                reward: REFERRAL_REWARD_POINTS,
                rewardDate: new Date(),
            });
            await referral.update({ rewardGiven: true });
            return referral;
        }
        catch (error) {
            console.error('Error processing referral reward:', error);
            throw error instanceof error_handler_1.AppError
                ? error
                : new error_handler_1.AppError('Failed to process reward', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Get stats
    async getReferralStats(userId) {
        try {
            const referrals = await Referral_1.Referral.findAll({
                where: { referrerUserId: userId },
                include: [
                    {
                        model: User_1.User,
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
                    rewardGiven: r.rewardGiven
                })),
            };
        }
        catch (error) {
            console.error('Error getting referral stats:', error);
            throw error instanceof error_handler_1.AppError
                ? error
                : new error_handler_1.AppError('Failed to fetch stats', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Get referral code and link
    async getReferralCode(userId) {
        try {
            const user = await User_1.User.findOne({
                where: { userId },
                attributes: ['referralCode'],
            });
            if (!user) {
                throw new error_handler_1.AppError('User not found', http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            return {
                referralCode: user.referralCode,
                referralLink: `${process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND}/referral/${user.referralCode}`,
            };
        }
        catch (error) {
            console.error('Error getting referral code:', error);
            throw error instanceof error_handler_1.AppError
                ? error
                : new error_handler_1.AppError('Failed to fetch referral code', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Process referral reward after tweet posting
    async processReferralAfterTweet(userId) {
        try {
            const referral = await Referral_1.Referral.findOne({
                where: {
                    referredUserId: userId,
                    rewardGiven: false
                },
                include: [
                    {
                        model: User_1.User,
                        as: 'referrer',
                        attributes: ['userId'],
                    },
                ],
            });
            if (!referral)
                return null;
            // Process the reward
            await this.processReferralReward(referral.referralId);
            return referral;
        }
        catch (error) {
            console.error('Error processing referral after tweet:', error);
            return null;
        }
    }
}
exports.default = new ReferralService();
//# sourceMappingURL=referralService.js.map