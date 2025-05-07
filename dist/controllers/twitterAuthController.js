"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCredentials = exports.uploadMedia = exports.postTweet = exports.twitterCallbackV2 = exports.twitterLoginV2 = void 0;
const twitter_api_v2_1 = require("twitter-api-v2");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const error_handler_2 = require("../utils/error-handler");
const twitterAuthService_1 = __importDefault(require("../services/twitterAuthService"));
const referralService_1 = __importDefault(require("../services/referralService"));
// In-memory store for temporary tokens (should be moved to Redis or DB in production)
const temporaryTokenStore = new Map();
// Initiate Twitter OAuth flow
exports.twitterLoginV2 = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    // Initialize Twitter client
    const client = new twitter_api_v2_1.TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
    });
    // Generate Twitter auth link
    const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(process.env.TWITTER_CALLBACK_URL);
    // Store tokens temporarily
    temporaryTokenStore.set(oauth_token, {
        accessToken: oauth_token,
        accessSecret: oauth_token_secret,
    });
    console.log("Redirecting to Twitter:", url);
    // Redirect user to Twitter authorization page
    res.redirect(url);
});
// Handle Twitter OAuth callback
exports.twitterCallbackV2 = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { oauth_token, oauth_verifier } = req.query;
    const referralCode = req.cookies.referral_code; // Get referral code from cookie
    if (!oauth_token || !oauth_verifier) {
        throw new error_handler_2.AppError('Missing OAuth parameters', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    console.log("OAuth Token : ", oauth_token);
    console.log("OAuth Verifier : ", oauth_verifier);
    const tempToken = oauth_token;
    const verifier = oauth_verifier;
    const stored = temporaryTokenStore.get(tempToken);
    if (!stored) {
        throw new error_handler_2.AppError('Invalid or expired token', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    try {
        // Complete the authentication process
        const { user, accessToken, accessSecret } = await twitterAuthService_1.default.completeAuthentication(tempToken, verifier, stored);
        // Look up or create user in the database
        const { userId, isNewUser } = await twitterAuthService_1.default.findOrCreateUser(user, accessToken, accessSecret);
        // Process referral if code exists and user is new
        if (referralCode && isNewUser) {
            await referralService_1.default.createReferral(referralCode, userId);
            // Clear the referral cookie
            res.clearCookie('referral_code');
        }
        // Prepare response data -- Earlier Used for app
        const responseData = {
            success: true,
            user: {
                userId,
                twitterId: user.id_str,
                username: user.screen_name,
                displayName: user.name,
                profilePicture: user.profile_image_url_https,
                isNewUser
            },
            tokens: {
                accessToken,
                accessSecret
            }
        };
        // Clean up temporary token store
        temporaryTokenStore.delete(tempToken);
        // Redirect to frontend with userId
        res.redirect(`${process.env.FRONTEND_URL || 'https://clans-landing.10on10studios.com'}/startRoaring/${userId}`);
    }
    catch (error) {
        console.error('Twitter authentication error:', error);
        next(error);
    }
});
exports.postTweet = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { userId, text, mediaId } = req.body;
    console.log("Received request to post tweet:", { userId, text, mediaId });
    if (!userId || !text) {
        throw new error_handler_2.AppError('Missing required parameters', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    try {
        const tweetResponse = await twitterAuthService_1.default.postTweet(userId, text, mediaId);
        // Process referral reward after successful tweet
        await referralService_1.default.processReferralAfterTweet(userId);
        // Print the entire tweet response to console
        console.log("Twitter API Response:", JSON.stringify(tweetResponse, null, 2));
        // Extract tweet ID from response
        const tweetId = tweetResponse?.tweet?.data?.id || null;
        console.log("Extracted Tweet ID:", tweetId);
        return res.status(http_status_1.HTTP_STATUS.CREATED).json({
            success: true,
            message: "Tweet posted successfully",
            tweetId,
            tweetData: tweetResponse?.tweet?.data || null,
        });
    }
    catch (error) {
        console.error('Error posting tweet:', error);
        next(error);
    }
});
// Upload media
exports.uploadMedia = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { userId } = req.params;
    const media = req.file;
    if (!userId || !media) {
        throw new error_handler_2.AppError('Missing required parameters', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    try {
        const mediaId = await twitterAuthService_1.default.uploadMedia(userId, media.buffer);
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            mediaId
        });
    }
    catch (error) {
        console.error('Error uploading media:', error);
        next(error);
    }
});
// Verify a user's tokens (for testing)
exports.verifyCredentials = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { userId } = req.params;
    if (!userId) {
        throw new error_handler_2.AppError('User ID is required', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    try {
        const user = await twitterAuthService_1.default.verifyCredentials(userId);
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            user
        });
    }
    catch (error) {
        console.error('Error verifying credentials:', error);
        next(error);
    }
});
//# sourceMappingURL=twitterAuthController.js.map