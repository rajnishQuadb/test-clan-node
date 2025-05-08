"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Early_User = exports.Get_Filtered_Users = exports.Get_All_Users = exports.Get_Single_User = exports.Update_User = exports.Create_User = void 0;
const userService_1 = __importDefault(require("../services/userService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const encryption_1 = require("../utils/encryption");
// Create a new user
exports.Create_User = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const userData = req.body;
    const { user, token } = await userService_1.default.createUser(userData);
    const responseData = {
        success: true,
        message: "User created successfully",
        token,
        data: {
            userId: user.userId,
            web3UserName: user.web3UserName,
            DiD: user.DiD,
            isActiveUser: user.isActiveUser,
            isEarlyUser: user.isEarlyUser,
            activeClanId: user.activeClanId,
            createdAt: user.createdAt,
        },
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
// Update an existing user
exports.Update_User = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const userId = req.params.id;
    const userData = req.body;
    const user = await userService_1.default.updateUser(userId, userData);
    const responseData = {
        success: true,
        message: "User updated successfully",
        data: {
            userId: user.userId,
            web3UserName: user.web3UserName,
            DiD: user.DiD,
            isActiveUser: user.isActiveUser,
            isEarlyUser: user.isEarlyUser,
            activeClanId: user.activeClanId,
            updatedAt: user.updatedAt,
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
// Get a single user by ID
exports.Get_Single_User = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const userId = req.params.id;
    const user = await userService_1.default.getUserById(userId);
    // Check if sensitive data should be excluded (for non-admin users)
    const isAdmin = req.headers["x-user-role"] === "admin";
    let responseData = {
        success: true,
        data: {
            userId: user.userId,
            web3UserName: user.web3UserName,
            DiD: user.DiD,
            isActiveUser: user.isActiveUser,
            isEarlyUser: user.isEarlyUser,
            activeClanId: user.activeClanId,
            clanJoinDate: user.clanJoinDate,
            referralCode: user.referralCode,
            createdAt: user.createdAt,
        },
    };
    // Include related data
    responseData.data.socialHandles = user.socialHandles?.map((handle) => ({
        provider: handle.provider,
        username: handle.username,
        displayName: handle.displayName,
        profilePicture: handle.profilePicture,
    }));
    // Only include wallet addresses for admin or self
    responseData.data.wallets = user.wallets?.map((wallet) => ({
        chain: wallet.chain,
        walletType: wallet.walletType,
        isPrimary: wallet.isPrimary,
        walletAddress: isAdmin ? wallet.walletAddress : undefined,
    }));
    // Only include reward history for admin or self
    if (isAdmin) {
        responseData.data.rewardHistory = user.rewardHistory;
    }
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
// Get all users with pagination
exports.Get_All_Users = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { users, total, pages } = await userService_1.default.getAllUsers(page, limit);
    // Map to simplified representation
    const simplifiedUsers = users.map((user) => ({
        userId: user.userId,
        web3UserName: user.web3UserName,
        DiD: user.DiD,
        isActiveUser: user.isActiveUser,
        isEarlyUser: user.isEarlyUser,
        activeClanId: user.activeClanId,
        socialHandlesCount: user.socialHandles?.length || 0,
        walletsCount: user.wallets?.length || 0,
        createdAt: user.createdAt,
    }));
    const responseData = {
        success: true,
        data: simplifiedUsers,
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
// Get filtered users (active/deleted) with pagination
exports.Get_Filtered_Users = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const status = req.body.status || "active";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { users, total, pages } = await userService_1.default.getFilteredUsers(status, page, limit);
    // Map to simplified representation
    const simplifiedUsers = users.map((user) => ({
        userId: user.userId,
        web3UserName: user.web3UserName,
        DiD: user.DiD,
        isActiveUser: user.isActiveUser,
        isEarlyUser: user.isEarlyUser,
        activeClanId: user.activeClanId,
        socialHandlesCount: user.socialHandles?.length || 0,
        walletsCount: user.wallets?.length || 0,
        createdAt: user.createdAt,
    }));
    const responseData = {
        success: true,
        filter: status,
        data: simplifiedUsers,
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
// upate user to the early user
// export const Early_User = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try{
//     const { userId, tweetId } = req.query;
//     if (!userId || typeof userId !== 'string') {
//       throw new AppError('Missing or invalid userID in query', HTTP_STATUS.BAD_REQUEST);
//     }
//     console.log("tweetId", tweetId);
//     console.log(typeof tweetId, tweetId);
//     const user = await userService.updateUserToEarlyUser(userId, tweetId as string);
//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       message: "User updated to early user successfully",
//       data: {
//         userId: user.userId,
//         referralCode: user.referralCode,
//         web3UserName: user.web3UserName,
//         DiD: user.DiD,
//         isActiveUser: user.isActiveUser,
//         isEarlyUser: user.isEarlyUser,
//         activeClanId: user.activeClanId,
//         updatedAt: user.updatedAt,
//       },
//     });
//   } catch (error) {
//     console.error("Error in Early_User controller:", error);
//     if (error instanceof AppError) {
//       return next(error);
//     }
//     return next(new AppError('Failed to update user to early user', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// }
// );
exports.Early_User = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        // Get userId and tweetId from query parameters
        const { userId, tweetId } = req.query;
        // Validate userId
        if (!userId || typeof userId !== 'string') {
            throw new error_handler_1.AppError('Missing or invalid userId in query parameters', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        // Log the incoming request details
        console.log(`Processing early user request for userId: ${userId}, tweetId: ${tweetId}`);
        console.log("tweetId type:", typeof tweetId);
        // Handle the optional tweetId parameter
        // If tweetId is provided but it's not a string, convert it to string
        const tweetIdParam = tweetId ? String(tweetId) : undefined;
        // Call the service method
        const user = await userService_1.default.updateUserToEarlyUser(userId, tweetIdParam);
        // Prepare success response
        const responseData = {
            success: true,
            message: "User updated to early user successfully",
            data: {
                userId: user.userId,
                referralCode: user.referralCode,
                web3UserName: user.web3UserName,
                DiD: user.DiD,
                isActiveUser: user.isActiveUser,
                isEarlyUser: user.isEarlyUser,
                activeClanId: user.activeClanId,
                updatedAt: user.updatedAt,
            },
        };
        // Return success response
        return res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
    }
    catch (error) {
        // Log detailed error information
        console.error("Error in Early_User controller:", error);
        // Handle AppError instances
        if (error instanceof error_handler_1.AppError) {
            return next(error);
        }
        // Handle unexpected errors
        return next(new error_handler_1.AppError('Failed to update user to early user', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
//# sourceMappingURL=userController.js.map