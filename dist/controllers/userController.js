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
// export const Get_Single_User = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.params.id;
//     const user = await userService.getUserById(userId);
//     // Check if sensitive data should be excluded (for non-admin users)
//     const isAdmin = req.headers["x-user-role"] === "admin";
//     let responseData: any = {
//       success: true,
//       data: {
//         userId: user.userId,
//         web3UserName: user.web3UserName,
//         DiD: user.DiD,
//         isActiveUser: user.isActiveUser,
//         isEarlyUser: user.isEarlyUser,
//         activeClanId: user.activeClanId,
//         clanJoinDate: user.clanJoinDate,
//         referralCode: user.referralCode,
//         createdAt: user.createdAt,
//       },
//     };
//     // Include related data
//     responseData.data.socialHandles = user.socialHandles?.map((handle) => ({
//       provider: handle.provider,
//       username: handle.username,
//       displayName: handle.displayName,
//       profilePicture: handle.profilePicture,
//     }));
//     // Only include wallet addresses for admin or self
//     responseData.data.wallets = user.wallets?.map((wallet) => ({
//       chain: wallet.chain,
//       walletType: wallet.walletType,
//       isPrimary: wallet.isPrimary,
//       walletAddress: isAdmin ? wallet.walletAddress : undefined,
//     }));
//     // Only include reward history for admin or self
//     if (isAdmin) {
//       responseData.data.rewardHistory = user.rewardHistory;
//     }
//     // Encrypt if needed
//     if (process.env.ENCRYPT_RESPONSES === "true") {
//       try {
//         const encryptedData = encryptData(responseData);
//         return res.status(HTTP_STATUS.OK).json({
//           encrypted: true,
//           data: encryptedData,
//         });
//       } catch (error) {
//         console.error("Encryption error:", error);
//         // Fall back to unencrypted response
//       }
//     }
//     res.status(HTTP_STATUS.OK).json(responseData);
//   }
// );
// Get a single user by ID
exports.Get_Single_User = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        const userId = req.params.id;
        // Validate user ID parameter
        if (!userId || typeof userId !== 'string') {
            throw new error_handler_1.AppError('Missing or invalid user ID', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        // Get user from service layer (will throw if not found)
        const user = await userService_1.default.getUserById(userId);
        // Check if user exists
        if (!user) {
            throw new error_handler_1.AppError(`User with ID ${userId} not found`, http_status_1.HTTP_STATUS.NOT_FOUND);
        }
        // Check if sensitive data should be excluded (for non-admin users)
        const isAdmin = req.headers["x-user-role"] === "admin";
        const isOwnProfile = req.headers["x-user-id"] === userId;
        const canViewSensitiveData = isAdmin || isOwnProfile;
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
        if (user.socialHandles) {
            responseData.data.socialHandles = user.socialHandles.map((handle) => ({
                provider: handle.provider,
                username: handle.username,
                displayName: handle.displayName,
                profilePicture: handle.profilePicture,
            }));
        }
        else {
            responseData.data.socialHandles = [];
        }
        // Only include wallet addresses for admin or self
        if (user.wallets) {
            responseData.data.wallets = user.wallets.map((wallet) => ({
                chain: wallet.chain,
                walletType: wallet.walletType,
                isPrimary: wallet.isPrimary,
                walletAddress: canViewSensitiveData ? wallet.walletAddress : undefined,
            }));
        }
        else {
            responseData.data.wallets = [];
        }
        // Only include reward history for admin or self
        if (canViewSensitiveData && user.rewardHistory) {
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
        return res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
    }
    catch (error) {
        console.error("Error in Get_Single_User controller:", error);
        // Handle known application errors
        if (error instanceof error_handler_1.AppError) {
            return next(error);
        }
        // Handle database-related errors
        if (error instanceof Error && error.name?.includes('Sequelize')) {
            return next(new error_handler_1.AppError('Database error while fetching user', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
        // Handle any other unexpected errors
        return next(new error_handler_1.AppError('Failed to retrieve user information', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// Get all users with pagination
// export const Get_All_Users = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const { users, total, pages } = await userService.getAllUsers(page, limit);
//     // Map to simplified representation
//     const simplifiedUsers = users.map((user) => ({
//       userId: user.userId,
//       web3UserName: user.web3UserName,
//       DiD: user.DiD,
//       isActiveUser: user.isActiveUser,
//       isEarlyUser: user.isEarlyUser,
//       activeClanId: user.activeClanId,
//       socialHandlesCount: user.socialHandles?.length || 0,
//       walletsCount: user.wallets?.length || 0,
//       createdAt: user.createdAt,
//     }));
//     const responseData = {
//       success: true,
//       data: simplifiedUsers,
//       pagination: {
//         total,
//         page,
//         pages,
//         limit,
//       },
//     };
//     // Encrypt if needed
//     if (process.env.ENCRYPT_RESPONSES === "true") {
//       try {
//         const encryptedData = encryptData(responseData);
//         return res.status(HTTP_STATUS.OK).json({
//           encrypted: true,
//           data: encryptedData,
//         });
//       } catch (error) {
//         console.error("Encryption error:", error);
//         // Fall back to unencrypted response
//       }
//     }
//     res.status(HTTP_STATUS.OK).json(responseData);
//   }
// );
// Get all users with pagination
exports.Get_All_Users = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        // Validate query parameters
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        // Check for invalid pagination parameters
        if (page < 0 || limit < 0) {
            throw new error_handler_1.AppError('Invalid pagination parameters. Page and limit must be positive numbers.', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        // Use default values if invalid or missing
        const validPage = !isNaN(page) ? page : 1;
        const validLimit = !isNaN(limit) ? limit : 10;
        const { users, total, pages } = await userService_1.default.getAllUsers(validPage, validLimit);
        // Check if users were found
        if (!users || users.length === 0) {
            // This is not an error, just an empty result
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                success: true,
                message: "No users found",
                data: [],
                pagination: {
                    total: 0,
                    page: validPage,
                    pages: 0,
                    limit: validLimit,
                },
            });
        }
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
                page: validPage,
                pages,
                limit: validLimit,
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
                // Don't fail the request if encryption fails, continue with unencrypted response
            }
        }
        return res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
    }
    catch (error) {
        // Log the error with details
        console.error("Error in Get_All_Users controller:", error);
        // Handle known application errors
        if (error instanceof error_handler_1.AppError) {
            return next(error);
        }
        // Handle database-related errors
        if (error instanceof Error && error.name?.includes('Sequelize')) {
            return next(new error_handler_1.AppError('Database error while fetching users', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
        // Handle any other unexpected errors
        return next(new error_handler_1.AppError('Failed to retrieve users', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
});
// Get filtered users (active/deleted) with pagination
// export const Get_Filtered_Users = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const status = req.body.status || "active";
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 10;
//     const { users, total, pages } = await userService.getFilteredUsers(
//       status,
//       page,
//       limit
//     );
//     // Map to simplified representation
//     const simplifiedUsers = users.map((user) => ({
//       userId: user.userId,
//       web3UserName: user.web3UserName,
//       DiD: user.DiD,
//       isActiveUser: user.isActiveUser,
//       isEarlyUser: user.isEarlyUser,
//       activeClanId: user.activeClanId,
//       socialHandlesCount: user.socialHandles?.length || 0,
//       walletsCount: user.wallets?.length || 0,
//       createdAt: user.createdAt,
//     }));
//     const responseData = {
//       success: true,
//       filter: status,
//       data: simplifiedUsers,
//       pagination: {
//         total,
//         page,
//         pages,
//         limit,
//       },
//     };
//     // Encrypt if needed
//     if (process.env.ENCRYPT_RESPONSES === "true") {
//       try {
//         const encryptedData = encryptData(responseData);
//         return res.status(HTTP_STATUS.OK).json({
//           encrypted: true,
//           data: encryptedData,
//         });
//       } catch (error) {
//         console.error("Encryption error:", error);
//         // Fall back to unencrypted response
//       }
//     }
//     res.status(HTTP_STATUS.OK).json(responseData);
//   }
// );
// Get filtered users (active/deleted) with pagination
exports.Get_Filtered_Users = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    try {
        // Validate and extract parameters
        const status = req.body.status;
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        // Validate status parameter
        if (status && status !== 'active' && status !== 'deleted') {
            throw new error_handler_1.AppError('Invalid status filter. Use "active" or "deleted"', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        // Check for invalid pagination parameters
        if (!isNaN(page) && page < 0 || !isNaN(limit) && limit < 0) {
            throw new error_handler_1.AppError('Invalid pagination parameters. Page and limit must be positive numbers.', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        // Use default values if invalid or missing
        const validStatus = status || 'active';
        const validPage = !isNaN(page) ? page : 1;
        const validLimit = !isNaN(limit) ? limit : 10;
        // Get filtered users from service
        const { users, total, pages } = await userService_1.default.getFilteredUsers(validStatus, validPage, validLimit);
        // Check if users were found
        if (!users || users.length === 0) {
            // This is not an error, just an empty result
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                success: true,
                message: `No ${validStatus} users found`,
                filter: validStatus,
                data: [],
                pagination: {
                    total: 0,
                    page: validPage,
                    pages: 0,
                    limit: validLimit,
                },
            });
        }
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
            filter: validStatus,
            data: simplifiedUsers,
            pagination: {
                total,
                page: validPage,
                pages,
                limit: validLimit,
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
        return res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
    }
    catch (error) {
        console.error("Error in Get_Filtered_Users controller:", error);
        // Handle known application errors
        if (error instanceof error_handler_1.AppError) {
            return next(error);
        }
        // Handle database-related errors
        if (error instanceof Error && error.name?.includes('Sequelize')) {
            return next(new error_handler_1.AppError('Database error while fetching filtered users', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }
        // Handle any other unexpected errors
        return next(new error_handler_1.AppError('Failed to retrieve filtered users', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
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
        const { status, message, user } = await userService_1.default.updateUserToEarlyUser(userId, tweetIdParam);
        if (user !== null) {
            const responseData = {
                success: true,
                message: message,
                //  isNewEarlyUser: status, // true if newly updated, false if already an early user
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
            return res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
        }
        else {
            throw new error_handler_1.AppError(message, http_status_1.HTTP_STATUS.FORBIDDEN);
        }
        // Prepare success response with the consistent data structure
        // Return success response
        //return res.status(HTTP_STATUS.OK).json(responseData);
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