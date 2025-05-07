"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const referralService_1 = __importDefault(require("../services/referralService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
class ReferralController {
    constructor() {
        // ----------   CHANGE TO REQ.BOODY   ----------
        this.getReferralStats = async (req, res) => {
            try {
                const userId = req.params.userId;
                if (!userId) {
                    throw new error_handler_1.AppError("User ID not provided or user not authenticated", http_status_1.HTTP_STATUS.UNAUTHORIZED);
                }
                const stats = await referralService_1.default.getReferralStats(userId);
                res.json(stats);
            }
            catch (error) {
                if (error instanceof error_handler_1.AppError) {
                    res.status(error.statusCode).json({ message: error.message });
                }
                else {
                    console.error("Error getting referral stats:", error);
                    res.status(http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        message: "Internal server error",
                    });
                }
            }
        };
        // Use a referral code -- Finally join the referal (Join Waitlist)
        this.useReferralCode = async (req, res) => {
            try {
                const { userId, referralCode } = req.body;
                if (!userId) {
                    throw new error_handler_1.AppError("User not authenticated", http_status_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!referralCode) {
                    throw new error_handler_1.AppError("Referral code is required", http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                const referral = await referralService_1.default.createReferral(referralCode, userId);
                res.json({
                    message: "Referral code applied successfully",
                    referral,
                });
            }
            catch (error) {
                if (error instanceof error_handler_1.AppError) {
                    res.status(error.statusCode).json({ message: error.message });
                }
                else {
                    console.error("Error using referral code:", error);
                    res.status(http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        message: "Internal server error",
                    });
                }
            }
        };
    }
}
exports.default = new ReferralController();
//# sourceMappingURL=referralController.js.map