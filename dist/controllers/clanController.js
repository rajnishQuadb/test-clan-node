"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete_Clan = exports.Update_Clan = exports.Join_Clan = exports.Get_All_Clans = exports.Get_Single_Clan = exports.Create_Clan = void 0;
const clanService_1 = __importDefault(require("../services/clanService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const error_handler_2 = require("../utils/error-handler");
exports.Create_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const clanPayload = req.body;
    const createdClan = await clanService_1.default.createClan(clanPayload);
    res.status(http_status_1.HTTP_STATUS.CREATED).json({
        success: true,
        data: createdClan,
    });
});
// Controller to fetch clan details
exports.Get_Single_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { clanId } = req.params;
    // Check if the clanId is provided
    if (!clanId) {
        return next(new error_handler_2.AppError('Clan ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
    }
    try {
        const clan = await clanService_1.default.getClan(clanId);
        // If no clan is found, return an error
        if (!clan) {
            return next(new error_handler_2.AppError('Clan not found.', http_status_1.HTTP_STATUS.NOT_FOUND));
        }
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            data: clan,
        });
    }
    catch (error) {
        // Handle different types of errors
        if (error instanceof error_handler_2.AppError) {
            return next(error);
        }
        console.error('Error in getClan controller:', error);
        return next(new error_handler_2.AppError('Something went wrong while fetching the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// Controller to fetch all clans
exports.Get_All_Clans = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        const clans = await clanService_1.default.getAllClans();
        // If no clans are found, return an empty array
        if (!clans || clans.length === 0) {
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                success: true,
                data: [],
            });
        }
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            data: clans,
        });
    }
    catch (error) {
        // Handle different types of errors
        if (error instanceof error_handler_2.AppError) {
            return next(error);
        }
        console.error('Error in getAllClans controller:', error);
        return next(new error_handler_2.AppError('Something went wrong while fetching the clans.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// User joins the clan
exports.Join_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { userId, clanId } = req.body;
    // Validate required parameters
    if (!userId || !clanId) {
        return next(new error_handler_2.AppError('Both userId and clanId are required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
    }
    try {
        // Call service method to handle business logic
        const result = await clanService_1.default.joinClan(userId, clanId);
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        // Handle specific error cases
        if (error instanceof error_handler_2.AppError) {
            return next(error);
        }
        console.error('Error in joinClan controller:', error);
        return next(new error_handler_2.AppError('Failed to join clan. Please try again later.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// User update the clan
exports.Update_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { clanId } = req.params;
    const updateData = req.body;
    const updatedClan = await clanService_1.default.updateClan(clanId, updateData);
    res.status(http_status_1.HTTP_STATUS.OK).json({
        success: true,
        data: updatedClan,
    });
});
exports.Delete_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { clanId } = req.params;
    await clanService_1.default.deleteClan(clanId);
    res.status(http_status_1.HTTP_STATUS.OK).json({
        success: true,
        message: 'Clan successfully deleted (status set to false).',
    });
});
//# sourceMappingURL=clanController.js.map