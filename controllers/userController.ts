import { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import { AppError, catchAsync } from "../utils/error-handler";
import { HTTP_STATUS } from "../constants/http-status";
import { UserDTO } from "../types/user";
import { encryptData } from "../utils/encryption";

// Create a new user
export const Create_User = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData: UserDTO = req.body;

    const { user, token } = await userService.createUser(userData);

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
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.CREATED).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.CREATED).json(responseData);
  }
);

// Update an existing user
export const Update_User = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const userData: Partial<UserDTO> = req.body;

    const user = await userService.updateUser(userId, userData);

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
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.OK).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  }
);

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
export const Get_Single_User = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      
      // Validate user ID parameter
      if (!userId || typeof userId !== 'string') {
        throw new AppError(
          'Missing or invalid user ID', 
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Get user from service layer (will throw if not found)
      const user = await userService.getUserById(userId);

      // Check if user exists
      if (!user) {
        throw new AppError(
          `User with ID ${userId} not found`, 
          HTTP_STATUS.NOT_FOUND
        );
      }

      // Check if sensitive data should be excluded (for non-admin users)
      const isAdmin = req.headers["x-user-role"] === "admin";
      const isOwnProfile = req.headers["x-user-id"] === userId;
      const canViewSensitiveData = isAdmin || isOwnProfile;

      let responseData: any = {
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
      } else {
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
      } else {
        responseData.data.wallets = [];
      }

      // Only include reward history for admin or self
      if (canViewSensitiveData && user.rewardHistory) {
        responseData.data.rewardHistory = user.rewardHistory;
      }

      // Encrypt if needed
      if (process.env.ENCRYPT_RESPONSES === "true") {
        try {
          const encryptedData = encryptData(responseData);
          return res.status(HTTP_STATUS.OK).json({
            encrypted: true,
            data: encryptedData,
          });
        } catch (error) {
          console.error("Encryption error:", error);
          // Fall back to unencrypted response
        }
      }

      return res.status(HTTP_STATUS.OK).json(responseData);
    } catch (error) {
      console.error("Error in Get_Single_User controller:", error);
      
      // Handle known application errors
      if (error instanceof AppError) {
        return next(error);
      }
      
      // Handle database-related errors
      if (error instanceof Error && error.name?.includes('Sequelize')) {
        return next(new AppError(
          'Database error while fetching user', 
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
      }
      
      // Handle any other unexpected errors
      return next(new AppError(
        'Failed to retrieve user information', 
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      ));
    }
  }
);

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
export const Get_All_Users = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      
      // Check for invalid pagination parameters
      if (page < 0 || limit < 0) {
        throw new AppError('Invalid pagination parameters. Page and limit must be positive numbers.', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Use default values if invalid or missing
      const validPage = !isNaN(page) ? page : 1;
      const validLimit = !isNaN(limit) ? limit : 10;

      const { users, total, pages } = await userService.getAllUsers(validPage, validLimit);

      // Check if users were found
      if (!users || users.length === 0) {
        // This is not an error, just an empty result
        return res.status(HTTP_STATUS.OK).json({
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
          const encryptedData = encryptData(responseData);
          return res.status(HTTP_STATUS.OK).json({
            encrypted: true,
            data: encryptedData,
          });
        } catch (error) {
          console.error("Encryption error:", error);
          // Don't fail the request if encryption fails, continue with unencrypted response
        }
      }

      return res.status(HTTP_STATUS.OK).json(responseData);
    } catch (error) {
      // Log the error with details
      console.error("Error in Get_All_Users controller:", error);
      
      // Handle known application errors
      if (error instanceof AppError) {
        return next(error);
      }
      
      // Handle database-related errors
      if (error instanceof Error && error.name?.includes('Sequelize')) {
        return next(new AppError(
          'Database error while fetching users', 
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
      }
      
      // Handle any other unexpected errors
      return next(new AppError(
        'Failed to retrieve users', 
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      ));
    }
  }
);

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
export const Get_Filtered_Users = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and extract parameters
      const status = req.body.status;
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);
      
      // Validate status parameter
      if (status && status !== 'active' && status !== 'deleted') {
        throw new AppError(
          'Invalid status filter. Use "active" or "deleted"', 
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      // Check for invalid pagination parameters
      if (!isNaN(page) && page < 0 || !isNaN(limit) && limit < 0) {
        throw new AppError(
          'Invalid pagination parameters. Page and limit must be positive numbers.', 
          HTTP_STATUS.BAD_REQUEST
        );
      }
      
      // Use default values if invalid or missing
      const validStatus = status || 'active';
      const validPage = !isNaN(page) ? page : 1;
      const validLimit = !isNaN(limit) ? limit : 10;

      // Get filtered users from service
      const { users, total, pages } = await userService.getFilteredUsers(
        validStatus,
        validPage,
        validLimit
      );

      // Check if users were found
      if (!users || users.length === 0) {
        // This is not an error, just an empty result
        return res.status(HTTP_STATUS.OK).json({
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
          const encryptedData = encryptData(responseData);
          return res.status(HTTP_STATUS.OK).json({
            encrypted: true,
            data: encryptedData,
          });
        } catch (error) {
          console.error("Encryption error:", error);
          // Fall back to unencrypted response
        }
      }

      return res.status(HTTP_STATUS.OK).json(responseData);
    } catch (error) {
      console.error("Error in Get_Filtered_Users controller:", error);
      
      // Handle known application errors
      if (error instanceof AppError) {
        return next(error);
      }
      
      // Handle database-related errors
      if (error instanceof Error && error.name?.includes('Sequelize')) {
        return next(new AppError(
          'Database error while fetching filtered users', 
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
      }
      
      // Handle any other unexpected errors
      return next(new AppError(
        'Failed to retrieve filtered users', 
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      ));
    }
  }
);

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


export const Early_User = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get userId and tweetId from query parameters
      const { userId, tweetId } = req.query;

      // Validate userId
      if (!userId || typeof userId !== 'string') {
        throw new AppError('Missing or invalid userId in query parameters', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Log the incoming request details
      console.log(`Processing early user request for userId: ${userId}, tweetId: ${tweetId}`);
      console.log("tweetId type:", typeof tweetId);
      
      // Handle the optional tweetId parameter
      // If tweetId is provided but it's not a string, convert it to string
      const tweetIdParam = tweetId ? String(tweetId) : undefined;
      
      // Call the service method
      const {status , message  , user} = await userService.updateUserToEarlyUser(userId, tweetIdParam);
      
      if(user !== null){
        const responseData = {
          success: true,
          message: message,
        //  isNewEarlyUser: status, // true if newly updated, false if already an early user
          data: {
            userId:  user.userId,
            referralCode: user.referralCode,
            web3UserName: user.web3UserName,
            DiD: user.DiD,
            isActiveUser: user.isActiveUser,
            isEarlyUser: user.isEarlyUser,
            activeClanId: user.activeClanId,
            updatedAt: user.updatedAt,
          },
        };
        

        return res.status(HTTP_STATUS.OK).json(responseData);
      }
      else{
        throw new AppError(message, HTTP_STATUS.FORBIDDEN);
      }
      
      // Prepare success response with the consistent data structure
   
      
      // Return success response
      //return res.status(HTTP_STATUS.OK).json(responseData);
    } catch (error) {
      // Log detailed error information
      console.error("Error in Early_User controller:", error);
      
      // Handle AppError instances
      if (error instanceof AppError) {
        return next(error);
      }
      
      // Handle unexpected errors
      return next(
        new AppError(
          'Failed to update user to early user', 
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);