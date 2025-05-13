"use strict";
// import { Request, Response } from "express";
// import referralService from "../services/referralService";
// import { AppError } from "../utils/error-handler";
// import { HTTP_STATUS } from "../constants/http-status";
// import { AuthRequest } from "../types/user";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const referralService_1 = __importDefault(require("../services/referralService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
class ReferralController {
    constructor() {
        // Get referral statistics
        this.getReferralStats = async (req, res) => {
            try {
                // Get userId from request params instead of body
                const userId = req.params.userId;
                // Validate userId
                if (!userId) {
                    throw new error_handler_1.AppError("User ID not provided", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(userId)) {
                    throw new error_handler_1.AppError("Invalid User ID format", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                const stats = await referralService_1.default.getReferralStats(userId);
                res.status(http_status_1.HTTP_STATUS.OK).json({
                    success: true,
                    data: stats
                });
                // Don't return the response
            }
            catch (error) {
                // ...error handling...
                if (error instanceof error_handler_1.AppError) {
                    res.status(error.statusCode).json({
                        success: false,
                        message: error.message
                    });
                }
                else {
                    console.error("Error getting referral stats:", error);
                    res.status(http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: "Failed to retrieve referral statistics"
                    });
                }
                // Don't return the response
            }
        };
        // Use a referral code -- Finally join the referral (Join Waitlist)
        this.useReferralCode = async (req, res) => {
            try {
                const { userId, referralCode } = req.body;
                // Validate userId
                if (!userId) {
                    throw new error_handler_1.AppError("User ID is required", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(userId)) {
                    throw new error_handler_1.AppError("Invalid User ID format", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate referral code
                if (!referralCode) {
                    throw new error_handler_1.AppError("Referral code is required", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Validate referral code format (alphanumeric, reasonable length)
                if (typeof referralCode !== 'string' || referralCode.length < 4 || referralCode.length > 20) {
                    throw new error_handler_1.AppError("Invalid referral code format", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Process the referral
                const referral = await referralService_1.default.createReferral(referralCode, userId);
                res.status(http_status_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: "Referral code applied successfully",
                    data: {
                        referralId: referral.referralId,
                        referrerUserId: referral.referrerUserId,
                        joinedAt: referral.joinedAt
                    }
                });
            }
            catch (error) {
                // Handle specific error cases
                if (error instanceof error_handler_1.AppError) {
                    // Different handling for different types of errors
                    if (error.message.includes('Invalid referral code')) {
                        return res.status(error.statusCode).json({
                            success: false,
                            message: "The referral code you entered is invalid"
                        });
                    }
                    else if (error.message.includes('own referral code')) {
                        return res.status(error.statusCode).json({
                            success: false,
                            message: "You cannot use your own referral code"
                        });
                    }
                    else if (error.message.includes('already has a referrer')) {
                        return res.status(error.statusCode).json({
                            success: false,
                            message: "You have already used a referral code"
                        });
                    }
                    else {
                        return res.status(error.statusCode).json({
                            success: false,
                            message: error.message
                        });
                    }
                }
                else {
                    console.error("Error using referral code:", error);
                    return res.status(http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: "Failed to process referral code. Please try again later."
                    });
                }
            }
        };
    }
}
exports.default = new ReferralController();
//# sourceMappingURL=referralController.js.map