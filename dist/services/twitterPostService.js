"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitterPostRepository_1 = __importDefault(require("../repositories/twitterPostRepository"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
class TwitterPostService {
    // Service function to post a tweet and handle referral logic
    async postTweetAndHandleReferral(userId, referralCode, text, media) {
        try {
            // Step 1: Fetch user and Twitter tokens
            const userWithTokens = await twitterPostRepository_1.default.getUserWithTokensByUserId(userId);
            console.log("User with tokens:", userWithTokens);
            if (!userWithTokens?.twitterAccessToken || !userWithTokens?.twitterRefreshToken) {
                throw new error_handler_1.AppError("User or Twitter tokens not found", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            const { twitterAccessToken, twitterRefreshToken } = userWithTokens;
            let mediaId;
            // Step 2: Upload image to Twitter if media is present
            if (media) {
                mediaId = await twitterPostRepository_1.default.uploadMediaToTwitter(media, twitterAccessToken);
                console.log("Uploaded media ID:", mediaId);
            }
            // Step 3: Post the tweet using text from payload
            const tweetResponse = await twitterPostRepository_1.default.postToTwitter(text, twitterAccessToken, twitterRefreshToken, mediaId);
            console.log("Tweet response:", tweetResponse);
            if (tweetResponse.error) {
                throw new error_handler_1.AppError("Failed to post tweet on Twitter", http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Step 4: If tweet posted and referral code exists, log referral
            if (tweetResponse?.data?.id && referralCode) {
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
                    tweetId: tweetResponse.data.id
                });
            }
            return { tweetResponse, referralCode };
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error posting tweet and processing referral:", error);
                throw new error_handler_1.AppError(error.message || "Internal Server Error", http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            else {
                console.error("Unknown error occurred:", error);
                throw new error_handler_1.AppError("An unknown error occurred", http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
exports.default = new TwitterPostService();
//# sourceMappingURL=twitterPostService.js.map