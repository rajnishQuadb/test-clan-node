"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_v2_1 = require("twitter-api-v2");
const uuid_1 = require("uuid");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const twitterAuthRepository_1 = __importDefault(require("../repositories/twitterAuthRepository"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
class TwitterAuthV2Service {
    // Complete Twitter authentication process
    async completeAuthentication(tempToken, verifier, stored) {
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_KEY,
            appSecret: process.env.TWITTER_CONSUMER_SECRET,
            accessToken: stored.accessToken,
            accessSecret: stored.accessSecret,
        });
        try {
            // Login and get the authenticated client
            const { accessToken, accessSecret, client: loggedClient, } = await client.login(verifier);
            // Get the user information
            const user = await loggedClient.currentUser();
            return {
                user,
                accessToken,
                accessSecret
            };
        }
        catch (error) {
            console.error('Twitter authentication error:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Authentication failed', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Find or create user in database
    async findOrCreateUser(twitterUser, accessToken, accessSecret) {
        try {
            // Check if user already exists
            const existingUser = await twitterAuthRepository_1.default.findBySocialId(twitterUser.data.id);
            console.log("existing user ", existingUser);
            if (existingUser) {
                // Update existing user with new tokens
                await twitterAuthRepository_1.default.updateTokens(existingUser.userId, accessToken, accessSecret);
                return {
                    userId: existingUser.userId,
                    isNewUser: false
                };
            }
            console.log("update ho gya");
            // Create new user and social handle
            const userId = (0, uuid_1.v4)();
            // Create user - store Twitter tokens in the User model
            // await TwitterAuthV2Repository.createUser({
            //   userId: twitterUser.data.id,
            //   web3UserName: `${twitterUser.screen_name}_${Date.now()}`,
            //   twitterAccessToken: accessToken,
            //   twitterRefreshToken: accessSecret, // Store accessSecret as refreshToken
            //   isActiveUser: true
            // });
            // // Create social handle - without tokens (they're stored in User model)
            // await TwitterAuthV2Repository.createSocialHandle({
            //   userId:twitterUser.data.id,
            //   provider: 'twitter',
            //   socialId: twitterUser.data.id,
            //   username: twitterUser.data.username,
            //   displayName: twitterUser.data.name,
            //   profilePicture: "na",
            //   email: "na" // Include email if available
            // });
            return {
                userId,
                isNewUser: true
            };
        }
        catch (error) {
            console.error('Error finding/creating user:', error);
            throw error;
        }
    }
    // Post a tweet
    async postTweet(userId, text, mediaId, referralCode) {
        try {
            // Get user's tokens from User model
            const user = await twitterAuthRepository_1.default.findUserById(userId);
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                throw new error_handler_1.AppError('User not authenticated with Twitter', http_status_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const client = new twitter_api_v2_1.TwitterApi(user.twitterAccessToken);
            // Prepare tweet payload
            const tweetPayload = { text };
            // Add media if provided
            if (mediaId) {
                tweetPayload.media = { media_ids: [mediaId] };
            }
            // Post the tweet
            const tweet = await client.v2.tweet(tweetPayload);
            if (tweet?.data?.id && referralCode) {
                const referrer = await userRepository_1.default.findUserByReferralCode(referralCode);
                if (!referrer) {
                    throw new error_handler_1.AppError('Invalid referral code', http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                await userRepository_1.default.createReferral({
                    referrerUserId: referrer.userId,
                    referredUserId: userId,
                    referralCode,
                    joinedAt: new Date(),
                    rewardGiven: false,
                    tweetId: tweet.data.id
                });
            }
            return { tweet, referralCode };
        }
        catch (error) {
            if (typeof error === 'object' &&
                error !== null &&
                'data' in error &&
                typeof error.data === 'object') {
                const structuredError = error;
                console.error('Twitter API Error (structured):', JSON.stringify(structuredError.data, null, 2));
                throw new error_handler_1.AppError(structuredError.data.detail || 'Failed to post tweet', structuredError.data.status || http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            else {
                console.error('Unknown Error posting tweet V2:', error);
            }
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to post tweet', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Upload media
    async uploadMedia(userId, mediaBuffer, mimeType = 'image/jpeg') {
        try {
            // Get user's tokens from User model
            const user = await twitterAuthRepository_1.default.findUserById(userId);
            console.log("media buffer ", mediaBuffer);
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                throw new error_handler_1.AppError('User not authenticated with Twitter', http_status_1.HTTP_STATUS.UNAUTHORIZED);
            }
            console.log("user ", user);
            // Create Twitter client with user's tokens
            const client = new twitter_api_v2_1.TwitterApi(user.twitterAccessToken);
            // Upload the media
            // const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType });
            const mediaId = await client.v2.uploadMedia(mediaBuffer, { media_type: "image/jpeg" });
            return mediaId;
        }
        catch (error) {
            console.error('Error uploading media:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to upload media', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Verify user credentials
    async verifyCredentials(userId) {
        try {
            // Get user's tokens from User model
            const user = await twitterAuthRepository_1.default.findUserById(userId);
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                throw new error_handler_1.AppError('User not authenticated with Twitter', http_status_1.HTTP_STATUS.UNAUTHORIZED);
            }
            // Create Twitter client with user's tokens
            const client = new twitter_api_v2_1.TwitterApi({
                appKey: process.env.TWITTER_CONSUMER_KEY,
                appSecret: process.env.TWITTER_CONSUMER_SECRET,
                accessToken: user.twitterAccessToken,
                accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
            });
            // Verify credentials by getting current user
            const twitterUser = await client.currentUser();
            return twitterUser;
        }
        catch (error) {
            console.error('Error verifying credentials:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to verify Twitter credentials', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = new TwitterAuthV2Service();
//# sourceMappingURL=twitterAuthV2Services.js.map