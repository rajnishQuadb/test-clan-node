"use strict";
// import { v4 as uuidv4 } from 'uuid';
// // import TwitterUser from '../models/TwitterUser';
// import UserSocialHandle from '../models/UserSocialHandle';
// import User from '../models/User';
// import { TwitterUserDTO } from '../types/twitterAuth';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const UserSocialHandle_1 = __importDefault(require("../models/UserSocialHandle"));
class TwitterAuthV2Repository {
    // Find a user by Twitter ID
    async findBySocialId(socialId) {
        try {
            const socialHandle = await UserSocialHandle_1.default.findOne({
                where: {
                    provider: 'twitter',
                    socialId
                },
                include: [{ model: User_1.default }]
            });
            return socialHandle;
        }
        catch (error) {
            console.error('Error finding user by Twitter ID:', error);
            throw error;
        }
    }
    // Create a new user
    async createUser(userData) {
        try {
            // Generate a random referral code
            const referralCode = Math.random().toString(36).substring(2, 10);
            // Create user with Twitter tokens
            const user = await User_1.default.create({
                userId: userData.userId,
                referralCode,
                web3UserName: userData.web3UserName,
                twitterAccessToken: userData.twitterAccessToken,
                twitterRefreshToken: userData.twitterRefreshToken,
                isEarlyUser: false,
                isActiveUser: userData.isActiveUser
            });
            return user;
        }
        catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }
    // Create a social handle for a user
    async createSocialHandle(data) {
        try {
            // Create social handle - NO tokens here, they're in the User model
            const socialHandle = await UserSocialHandle_1.default.create({
                userId: data.userId,
                provider: data.provider,
                socialId: data.socialId,
                username: data.username,
                displayName: data.displayName,
                profilePicture: data.profilePicture,
                email: data.email
            });
            return socialHandle;
        }
        catch (error) {
            console.error('Error creating social handle:', error);
            throw error;
        }
    }
    // Update a user's Twitter tokens
    async updateTokens(userId, accessToken, refreshToken) {
        try {
            // Update only the User record with new tokens
            await User_1.default.update({
                twitterAccessToken: accessToken,
                twitterRefreshToken: refreshToken
            }, {
                where: { userId }
            });
            return true;
        }
        catch (error) {
            console.error('Error updating tokens:', error);
            throw error;
        }
    }
    // Find a user by ID
    async findUserById(userId) {
        try {
            const user = await User_1.default.findOne({
                where: { userId },
                include: [{
                        model: UserSocialHandle_1.default,
                        as: 'socialHandles',
                        where: { provider: 'twitter' },
                        required: false
                    }]
            });
            return user;
        }
        catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }
    // Get user tokens from User model
    async getUserTokens(userId) {
        try {
            // Find the user to get tokens directly from the User model
            const user = await User_1.default.findOne({
                where: { userId },
                attributes: ['twitterAccessToken', 'twitterRefreshToken']
            });
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                return null;
            }
            return {
                accessToken: user.twitterAccessToken,
                accessSecret: user.twitterRefreshToken // Using refreshToken as accessSecret
            };
        }
        catch (error) {
            console.error('Error getting user tokens:', error);
            throw error;
        }
    }
    // Update user social handle profile
    async updateUserSocialHandle(userId, data) {
        try {
            const socialHandle = await UserSocialHandle_1.default.findOne({
                where: {
                    userId,
                    provider: 'twitter'
                }
            });
            if (!socialHandle)
                return null;
            await socialHandle.update(data);
            return socialHandle;
        }
        catch (error) {
            console.error('Error updating user social handle:', error);
            throw error;
        }
    }
}
exports.default = new TwitterAuthV2Repository();
//# sourceMappingURL=twitterAuthRepository.js.map