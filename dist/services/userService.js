"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const db_1 = __importDefault(require("../config/db"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSocialHandle_1 = require("../models/UserSocialHandle");
const UserTweets_1 = __importDefault(require("../models/UserTweets"));
class UserService {
    // Add this method to your UserService class
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || 'your-default-secret', { expiresIn: '30d' });
    }
    // Change return type here ↓
    async createUser(userData) {
        try {
            // Validate required fields
            if (!userData.web3UserName) {
                throw new error_handler_1.AppError('web3UserName is required', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Check if username is already taken
            try {
                const existingUser = await userRepository_1.default.findAll();
                const duplicate = existingUser.users.find(user => user.web3UserName.toLowerCase() === userData.web3UserName.toLowerCase());
                if (duplicate) {
                    throw new error_handler_1.AppError('web3UserName already exists', http_status_1.HTTP_STATUS.CONFLICT);
                }
            }
            catch (error) {
                if (error instanceof error_handler_1.AppError)
                    throw error;
                // If error is not about duplicate, continue
            }
            // Set defaults
            userData.isActiveUser = userData.isActiveUser ?? true;
            userData.isEarlyUser = userData.isEarlyUser ?? false;
            const user = await userRepository_1.default.createUser(userData);
            // Generate token here
            const token = this.generateToken(user.userId);
            return { user, token };
        }
        catch (error) {
            if (error instanceof error_handler_1.AppError)
                throw error;
            console.error('Error in createUser service:', error);
            throw new error_handler_1.AppError('Failed to create user', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    async updateUser(userId, userData) {
        try {
            // Check if user exists
            await this.getUserById(userId);
            // If updating web3UserName, check if it's already taken
            if (userData.web3UserName) {
                try {
                    const existingUser = await userRepository_1.default.findAll();
                    const duplicate = existingUser.users.find(user => user.web3UserName.toLowerCase() === userData.web3UserName?.toLowerCase() &&
                        user.userId !== userId);
                    if (duplicate) {
                        throw new error_handler_1.AppError('web3UserName already exists', http_status_1.HTTP_STATUS.CONFLICT);
                    }
                }
                catch (error) {
                    if (error instanceof error_handler_1.AppError)
                        throw error;
                    // If error is not about duplicate, continue
                }
            }
            return await userRepository_1.default.updateUser(userId, userData);
        }
        catch (error) {
            if (error instanceof error_handler_1.AppError)
                throw error;
            console.error('Error in updateUser service:', error);
            throw new error_handler_1.AppError('Failed to update user', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserById(userId) {
        try {
            return await userRepository_1.default.findById(userId);
        }
        catch (error) {
            console.error('Error in getUserById service:', error);
            throw new error_handler_1.AppError('User not found', http_status_1.HTTP_STATUS.NOT_FOUND);
        }
    }
    async getAllUsers(page = 1, limit = 10) {
        try {
            return await userRepository_1.default.findAll(page, limit);
        }
        catch (error) {
            console.error('Error in getAllUsers service:', error);
            throw new error_handler_1.AppError('Failed to fetch users', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    async getFilteredUsers(status, page = 1, limit = 10) {
        try {
            if (status !== 'active' && status !== 'deleted') {
                throw new error_handler_1.AppError('Invalid status filter. Use "active" or "deleted"', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const isActive = status === 'active';
            return await userRepository_1.default.findByStatus(isActive, page, limit);
        }
        catch (error) {
            if (error instanceof error_handler_1.AppError)
                throw error;
            console.error('Error in getFilteredUsers service:', error);
            throw new error_handler_1.AppError('Failed to fetch filtered users', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // async updateUserToEarlyUser(userId: string, tweetId: string) {
    //   const user = await userRepository.findUserById(userId);
    //   if (!user) {
    //     throw new AppError("User not found", 404);
    //   }
    //   // Update user to early user
    //   user.isEarlyUser = true;
    //   // Try to create tweet record
    //   let tweetRecord;
    //   try {
    //     tweetRecord = await UserTweets.create({
    //       tweetId,
    //       userId,
    //       isEarlyTweet: true,
    //     });
    //     console.log("Tweet Record Created:", tweetRecord);
    //   } catch (error: any) {
    //     console.error("Failed to create tweet record:", error.message);
    //     // Optionally, log full error to a logging service here
    //     throw new AppError("Failed to record tweett User is already an early user", 500);
    //   }
    //   // Save the updated user
    //   await userRepository.saveUser(user);
    //   return user;
    // }
    // In userService.ts
    async updateUserToEarlyUser(userId, tweetId) {
        try {
            // Find the user first
            const user = await userRepository_1.default.findUserById(userId);
            if (!user) {
                throw new error_handler_1.AppError("User not found", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            // Check if user is already an early user
            if (user.isEarlyUser) {
                console.log(`User ${userId} is already an early user`);
                // Return consistent object structure with user data and status
                return {
                    user: null,
                    message: `User ${userId} is already an early user`,
                    status: false
                };
            }
            // Update user to early user
            user.isEarlyUser = true;
            try {
                // Save the updated user
                await userRepository_1.default.saveUser(user);
                // Only create tweet record if tweetId is provided
                if (tweetId) {
                    // Check if this tweet is already recorded
                    const existingTweet = await UserTweets_1.default.findOne({
                        where: { tweetId },
                        include: [{
                                model: User_1.User,
                                as: 'user',
                                where: { userId }
                            }]
                    });
                    if (existingTweet) {
                        console.log(`Tweet ${tweetId} is already recorded`);
                    }
                    else {
                        await UserTweets_1.default.create({
                            tweetId,
                            userId,
                            isEarlyTweet: true,
                        });
                        console.log(`Tweet record created for tweet ID: ${tweetId}, user ID: ${userId}`);
                    }
                }
                console.log(`User ${userId} successfully updated to early user`);
                // Return consistent object structure with user data and status
                return {
                    user: user,
                    message: "User updated to early user successfully",
                    status: true
                };
            }
            catch (error) {
                console.error("Transaction failed:", error);
                if (error.name === 'SequelizeUniqueConstraintError') {
                    throw new error_handler_1.AppError("This tweet has already been recorded for an early user", http_status_1.HTTP_STATUS.CONFLICT);
                }
                throw new error_handler_1.AppError(`Failed to update user to early user: ${error.message}`, http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        }
        catch (error) {
            // Catch any errors
            if (error instanceof error_handler_1.AppError) {
                throw error; // Re-throw AppError instances
            }
            console.error("Unexpected error in updateUserToEarlyUser:", error);
            throw new error_handler_1.AppError("An unexpected error occurred while updating user to early user", http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Add this method to your UserService class
    async findOrCreateUserBySocialId(provider, socialId, userData) {
        try {
            // Check if a social handle with this provider and ID exists
            const existingSocialHandle = await UserSocialHandle_1.UserSocialHandle.findOne({
                where: {
                    provider,
                    socialId
                },
                include: [{
                        model: User_1.User,
                        as: 'user'
                    }]
            });
            // If user exists, update the tokens and return the user
            if (existingSocialHandle && existingSocialHandle.user) {
                // Update tokens if they've changed
                if (provider === 'twitter' && userData.twitterAccessToken) {
                    await existingSocialHandle.update({
                        username: userData.username,
                        displayName: userData.displayName,
                        profilePicture: userData.profilePicture || existingSocialHandle.profilePicture
                    });
                    // Store encrypted tokens if user service has access to User model
                    const user = existingSocialHandle.user;
                    if (userData.twitterAccessToken) {
                        user.twitterAccessToken = userData.twitterAccessToken;
                    }
                    if (userData.twitterRefreshToken) {
                        user.twitterRefreshToken = userData.twitterRefreshToken;
                    }
                    await user.save();
                }
                return {
                    userId: existingSocialHandle.user.userId,
                    isNewUser: false
                };
            }
            // User doesn't exist, create a new user and social handle
            // Generate a unique web3 username if one doesn't exist
            const web3UserName = userData.username || `${provider}_${socialId.substring(0, 8)}`;
            // Create transaction to ensure both user and social handle are created
            const transaction = await db_1.default.transaction();
            try {
                // Create new user
                const newUser = await User_1.User.create({
                    web3UserName,
                    DiD: `did:${provider}:${socialId}`,
                    isEarlyUser: false,
                    isActiveUser: true,
                    // Add twitter tokens if twitter provider
                    ...(provider === 'twitter' && userData.twitterAccessToken ? {
                        twitterAccessToken: userData.twitterAccessToken,
                        twitterRefreshToken: userData.twitterRefreshToken
                    } : {})
                }, { transaction });
                // Create social handle linked to user
                await UserSocialHandle_1.UserSocialHandle.create({
                    userId: newUser.userId,
                    provider,
                    socialId: userData.socialId,
                    username: userData.username,
                    email: userData.email,
                    displayName: userData.displayName,
                    profilePicture: userData.profilePicture
                }, { transaction });
                await transaction.commit();
                return {
                    userId: newUser.userId,
                    isNewUser: true
                };
            }
            catch (error) {
                await transaction.rollback();
                throw error;
            }
        }
        catch (error) {
            console.error('Error in findOrCreateUserBySocialId:', error);
            throw new error_handler_1.AppError('Failed to find or create user', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = new UserService();
//# sourceMappingURL=userService.js.map