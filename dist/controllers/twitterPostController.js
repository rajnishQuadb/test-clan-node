"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostTweet = void 0;
const twitterPostService_1 = __importDefault(require("../services/twitterPostService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const error_handler_2 = require("../utils/error-handler");
exports.PostTweet = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    // Get the tweet text, referral code, and token from the request
    const { text, referralCode, userId, media } = req.body;
    // Validate the input parameters
    if (!text || typeof text !== 'string') {
        throw new error_handler_2.AppError('Tweet text is required', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    try {
        // Post the tweet and handle the referral logic using the service function
        const result = await twitterPostService_1.default.postTweetAndHandleReferral(userId, referralCode, text, media);
        // Send success response with the tweet data and referral code
        res.status(http_status_1.HTTP_STATUS.CREATED).json({
            success: true,
            tweet: result.tweetResponse,
            referralCode: result.referralCode,
        });
    }
    catch (error) {
        // Handle errors from the service function
        if (error instanceof error_handler_2.AppError) {
            next(error); // Pass the error to the error handler middleware
        }
        else {
            console.error('Error posting tweet and processing referral:', error);
            next(new error_handler_2.AppError('Internal Server Error', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
    }
});
//# sourceMappingURL=twitterPostController.js.map