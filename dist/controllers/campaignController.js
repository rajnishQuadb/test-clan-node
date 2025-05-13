"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get_User_Joined_Campaigns = exports.Update_Leaderboard_Points = exports.Get_Filtered_Campaigns = exports.Get_All_Campaigns = exports.Get_Single_Campaign = exports.Join_Campaign = exports.Create_Campaign = void 0;
const campaignService_1 = __importDefault(require("../services/campaignService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const encryption_1 = require("../utils/encryption");
const error_handler_2 = require("../utils/error-handler");
// Create a new campaign
exports.Create_Campaign = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const campaignData = req.body;
    const campaign = await campaignService_1.default.createCampaign(campaignData);
    const responseData = {
        success: true,
        message: "Campaign created successfully",
        data: campaign,
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.CREATED).json({
                encrypted: true,
                data: encryptedData,
            });
        }
        catch (error) {
            console.error("Encryption error:", error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.CREATED).json(responseData);
});
// Join a campaign
exports.Join_Campaign = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const joinRequest = req.body;
    const result = await campaignService_1.default.joinCampaign(joinRequest);
    const responseData = {
        success: true,
        message: result.message,
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData,
            });
        }
        catch (error) {
            console.error("Encryption error:", error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// Get a single campaign by ID
exports.Get_Single_Campaign = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const campaignId = req.params.id;
    const campaign = await campaignService_1.default.getCampaignById(campaignId);
    const responseData = {
        success: true,
        data: campaign,
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData,
            });
        }
        catch (error) {
            console.error("Encryption error:", error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// Get all campaigns with pagination
exports.Get_All_Campaigns = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { campaigns, total, pages } = await campaignService_1.default.getAllCampaigns(page, limit);
    const responseData = {
        success: true,
        data: campaigns,
        pagination: {
            total,
            page,
            pages,
            limit,
        },
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData,
            });
        }
        catch (error) {
            console.error("Encryption error:", error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// Get filtered campaigns (active/expired/upcoming)
exports.Get_Filtered_Campaigns = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const status = req.body.status || "active";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { campaigns, total, pages, filter } = await campaignService_1.default.getFilteredCampaigns(status, page, limit);
    const responseData = {
        success: true,
        filter,
        data: campaigns,
        pagination: {
            total,
            page,
            pages,
            limit,
        },
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData,
            });
        }
        catch (error) {
            console.error("Encryption error:", error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// Update leaderboard points
exports.Update_Leaderboard_Points = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const updateRequest = req.body;
    const result = await campaignService_1.default.updateLeaderboardPoints(updateRequest);
    const responseData = {
        success: true,
        message: result.message,
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData,
            });
        }
        catch (error) {
            console.error("Encryption error:", error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
/**
 * Get campaigns joined by a specific user
 * @route POST /api/campaigns/fetch/user-joined
 */
// Modified function - don't return the response object
const Get_User_Joined_Campaigns = async (req, res, next) => {
    try {
        const { userId, status } = req.body;
        // Extract pagination parameters from query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Basic validation
        if (!userId) {
            res.status(http_status_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "User ID is required",
                statusCode: http_status_1.HTTP_STATUS.BAD_REQUEST,
            });
            return;
        }
        // Get joined campaigns from service with pagination
        const { campaigns, total, pages } = await campaignService_1.default.getUserJoinedCampaigns(userId, status, page, limit);
        // Send success response with pagination info
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            message: "User joined campaigns retrieved successfully",
            data: campaigns,
            pagination: {
                total,
                page,
                pages,
                limit,
            },
        });
    }
    catch (error) {
        console.error("Controller error in Get_User_Joined_Campaigns:", error);
        // Handle AppError instances
        if (error instanceof error_handler_2.AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
                statusCode: error.statusCode,
            });
        }
        else {
            // Handle other errors
            res.status(http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "An error occurred while fetching joined campaigns",
                statusCode: http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR,
            });
        }
    }
};
exports.Get_User_Joined_Campaigns = Get_User_Joined_Campaigns;
// Ensure all your other controller functions follow the same pattern
// Don't return the res.json() calls
//# sourceMappingURL=campaignController.js.map