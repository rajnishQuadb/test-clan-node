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
            const existingUser = await twitterAuthRepository_1.default.findBySocialId(twitterUser.id_str);
            if (existingUser) {
                // Update existing user with new tokens
                await twitterAuthRepository_1.default.updateTokens(existingUser.userId, accessToken, accessSecret);
                return {
                    userId: existingUser.userId,
                    isNewUser: false
                };
            }
            // Create new user and social handle
            const userId = (0, uuid_1.v4)();
            // Create user - store Twitter tokens in the User model
            await twitterAuthRepository_1.default.createUser({
                userId,
                web3UserName: `${twitterUser.screen_name}_${Date.now()}`,
                twitterAccessToken: accessToken,
                twitterRefreshToken: accessSecret, // Store accessSecret as refreshToken
                isActiveUser: true
            });
            // Create social handle - without tokens (they're stored in User model)
            await twitterAuthRepository_1.default.createSocialHandle({
                userId,
                provider: 'twitter',
                socialId: twitterUser.id_str,
                username: twitterUser.screen_name,
                displayName: twitterUser.name,
                profilePicture: twitterUser.profile_image_url_https,
                email: twitterUser.email // Include email if available
            });
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
    async postTweet(userId, text, mediaId) {
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
            // Prepare tweet payload
            const tweetPayload = { text };
            // Add media if provided
            if (mediaId) {
                tweetPayload.media = { media_ids: [mediaId] };
            }
            // Post the tweet
            const tweet = await client.v2.tweet(tweetPayload);
            return tweet;
        }
        catch (error) {
            console.error('Error posting tweet:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to post tweet', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Upload media
    async uploadMedia(userId, mediaBuffer, mimeType = 'image/jpeg') {
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
            // Upload the media
            const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType });
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
//# sourceMappingURL=twitterAuthService.js.map