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
// export const Get_Single_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { clanId } = req.params;
//   // Check if the clanId is provided
//   if (!clanId) {
//     return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
//   }
//   try {
//     const clan = await clanService.getClan(clanId);
//     // If no clan is found, return an error
//     if (!clan) {
//       return next(new AppError('Clan not found.', HTTP_STATUS.NOT_FOUND));
//     }
//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       data: clan,
//     });
//   } catch (error) {
//     // Handle different types of errors
//     if (error instanceof AppError) {
//       return next(error);
//     }
//     console.error('Error in getClan controller:', error);
//     return next(new AppError('Something went wrong while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// });
// Controller to fetch clan details
// export const Get_Single_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { clanId } = req.params;
//     // Check if the clanId is provided
//     if (!clanId) {
//       return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
//     }
//     // Validate clanId format (assuming it's a UUID)
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//     if (!uuidRegex.test(clanId)) {
//       return next(new AppError('Invalid Clan ID format.', HTTP_STATUS.BAD_REQUEST));
//     }
//     const clan = await clanService.getClan(clanId);
//     // If no clan is found, return an error
//     if (!clan) {
//       return ({
//         success: false,
//         message: `Clan with ID ${clanId} not found.`,
//         data: null
//       });
//     }
//     else {
//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       message: "Clan retrieved successfully",
//       data: clan
//     });
//   }
//   } catch (error) {
//     // Handle different types of errors
//     console.error('Error in getClan controller:', error);
//     if (error instanceof AppError) {
//       return next(error);
//     }
//     // Handle Sequelize database errors specifically
//     if (error instanceof Error && error.name?.includes('Sequelize')) {
//       return next(new AppError('Database error while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//     }
//     return next(new AppError('Something went wrong while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// });
exports.Get_Single_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        const { clanId } = req.params;
        // Check if the clanId is provided
        if (!clanId) {
            return next(new error_handler_2.AppError('Clan ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        // Validate clanId format (assuming it's a UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(clanId)) {
            return next(new error_handler_2.AppError('Invalid Clan ID format.', http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        const clan = await clanService_1.default.getClan(clanId);
        // If no clan is found, return a structured response with 404 status
        if (!clan) {
            return res.status(http_status_1.HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: `Clan with ID ${clanId} not found.`,
                data: null
            });
        }
        // Return success response
        return res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            message: "Clan retrieved successfully",
            data: clan
        });
    }
    catch (error) {
        // Handle different types of errors
        console.error('Error in getClan controller:', error);
        if (error instanceof error_handler_2.AppError) {
            return next(error);
        }
        // Handle Sequelize database errors specifically
        if (error instanceof Error && error.name?.includes('Sequelize')) {
            return next(new error_handler_2.AppError('Database error while fetching the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
        return next(new error_handler_2.AppError('Something went wrong while fetching the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// Controller to fetch all clans
exports.Get_All_Clans = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        const clans = await clanService_1.default.getAllClans();
        // If no clans are found, return an empty array (this is not an error)
        if (!clans || clans.length === 0) {
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                success: true,
                message: "No clans found",
                data: [],
                count: 0
            });
        }
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            data: clans,
            count: clans.length
        });
    }
    catch (error) {
        // Handle different types of errors
        console.error('Error in getAllClans controller:', error);
        if (error instanceof error_handler_2.AppError) {
            return next(error);
        }
        // Handle Sequelize database errors specifically
        if (error instanceof Error && error.name?.includes('Sequelize')) {
            return next(new error_handler_2.AppError('Database error while fetching clans.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
        return next(new error_handler_2.AppError('Something went wrong while fetching the clans.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// User joins the clan
// export const Join_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { userId, clanId } = req.body;
//   // Validate required parameters
//   if (!userId || !clanId) {
//     return next(new AppError('Both userId and clanId are required.', HTTP_STATUS.BAD_REQUEST));
//   }
//   try {
//     // Call service method to handle business logic
//     const result = await clanService.joinClan(userId, clanId);
//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     // Handle specific error cases
//     if (error instanceof AppError) {
//       return next(error);
//     }
//     console.error('Error in joinClan controller:', error);
//     return next(new AppError('Failed to join clan. Please try again later.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// });
// User joins the clan
exports.Join_Clan = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        const { userId, clanId } = req.body;
        // Validate required parameters
        if (!userId) {
            return next(new error_handler_2.AppError('User ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        if (!clanId) {
            return next(new error_handler_2.AppError('Clan ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        // Validate userId format (assuming it's a UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return next(new error_handler_2.AppError('Invalid User ID format.', http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        // Validate clanId format (assuming it's a UUID)
        if (!uuidRegex.test(clanId)) {
            return next(new error_handler_2.AppError('Invalid Clan ID format.', http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        // Call service method to handle business logic
        const result = await clanService_1.default.joinClan(userId, clanId);
        res.status(http_status_1.HTTP_STATUS.OK).json({
            success: true,
            message: "User successfully joined the clan",
            data: result
        });
    }
    catch (error) {
        // Handle specific error cases
        console.error('Error in joinClan controller:', error);
        if (error instanceof error_handler_2.AppError) {
            // Specific error handling for the time restriction
            if (error.message.includes('Cannot join a new clan within 1 month')) {
                return next(new error_handler_2.AppError(error.message, http_status_1.HTTP_STATUS.BAD_REQUEST));
            }
            return next(error);
        }
        // Handle Sequelize database errors specifically
        if (error instanceof Error && error.name?.includes('Sequelize')) {
            return next(new error_handler_2.AppError('Database error while joining the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
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