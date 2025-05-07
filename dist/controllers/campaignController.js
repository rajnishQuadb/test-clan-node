"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Update_Leaderboard_Points = exports.Get_Filtered_Campaigns = exports.Get_All_Campaigns = exports.Get_Single_Campaign = exports.Join_Campaign = exports.Create_Campaign = void 0;
const campaignService_1 = __importDefault(require("../services/campaignService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const encryption_1 = require("../utils/encryption");
// Create a new campaign
exports.Create_Campaign = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const campaignData = req.body;
    const campaign = await campaignService_1.default.createCampaign(campaignData);
    const responseData = {
        success: true,
        message: 'Campaign created successfully',
        data: campaign
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.CREATED).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
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
        message: result.message
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
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
        data: campaign
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
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
            limit
        }
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// Get filtered campaigns (active/expired/upcoming)
exports.Get_Filtered_Campaigns = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const status = req.body.status || 'active';
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
            limit
        }
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
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
        message: result.message
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
//# sourceMappingURL=campaignController.js.map