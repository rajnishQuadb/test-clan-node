import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { UserDTO } from '../types/user';
import { AppError } from '../utils/error-handler';
import jwt from 'jsonwebtoken';

// Create a new user
export const Create_User = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userData: UserDTO = req.body;
  
  const user = await userService.createUser(userData);
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.userId },  // Make sure it's "id" to match what your auth middleware expects
    process.env.JWT_SECRET || 'your-default-secret',
    { expiresIn: '30d' }
  );
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User created successfully',
    token, // Include token in response
    data: {
      userId: user.userId,
      web3UserName: user.web3UserName,
      DiD: user.DiD,
      isActiveUser: user.isActiveUser,
      isEarlyUser: user.isEarlyUser,
      activeClanId: user.activeClanId,
      createdAt: user.createdAt
    }
  });
});


// Update an existing user
export const Update_User = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const userData: Partial<UserDTO> = req.body;
  
  const user = await userService.updateUser(userId, userData);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User updated successfully',
    data: {
      userId: user.userId,
      web3UserName: user.web3UserName,
      DiD: user.DiD,
      isActiveUser: user.isActiveUser,
      isEarlyUser: user.isEarlyUser,
      activeClanId: user.activeClanId,
      updatedAt: user.updatedAt
    }
  });
});

// Get a single user by ID
export const Get_Single_User = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  
  const user = await userService.getUserById(userId);
  
  // Check if sensitive data should be excluded (for non-admin users)
  const isAdmin = req.headers['x-user-role'] === 'admin';
  
  let responseData: any = {
    userId: user.userId,
    web3UserName: user.web3UserName,
    DiD: user.DiD,
    isActiveUser: user.isActiveUser,
    isEarlyUser: user.isEarlyUser,
    activeClanId: user.activeClanId,
    clanJoinDate: user.clanJoinDate,
    createdAt: user.createdAt
  };
  
  // Include related data
  responseData.socialHandles = user.socialHandles?.map(handle => ({
    provider: handle.provider,
    username: handle.username,
    displayName: handle.displayName,
    profilePicture: handle.profilePicture
  }));
  
  // Only include wallet addresses for admin or self
  responseData.wallets = user.wallets?.map(wallet => ({
    chain: wallet.chain,
    walletType: wallet.walletType,
    isPrimary: wallet.isPrimary,
    walletAddress: isAdmin ? wallet.walletAddress : undefined
  }));
  
  // Only include reward history for admin or self
  if (isAdmin) {
    responseData.rewardHistory = user.rewardHistory;
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: responseData
  });
});

// Get all users with pagination
export const Get_All_Users = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { users, total, pages } = await userService.getAllUsers(page, limit);
  
  // Map to simplified representation
  const simplifiedUsers = users.map(user => ({
    userId: user.userId,
    web3UserName: user.web3UserName,
    DiD: user.DiD,
    isActiveUser: user.isActiveUser,
    isEarlyUser: user.isEarlyUser,
    activeClanId: user.activeClanId,
    socialHandlesCount: user.socialHandles?.length || 0,
    walletsCount: user.wallets?.length || 0,
    createdAt: user.createdAt
  }));
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: simplifiedUsers,
    pagination: {
      total,
      page,
      pages,
      limit
    }
  });
});

// Get filtered users (active/deleted) with pagination
export const Get_Filtered_Users = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const status = req.body.status || 'active';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const { users, total, pages } = await userService.getFilteredUsers(status, page, limit);
  
  // Map to simplified representation
  const simplifiedUsers = users.map(user => ({
    userId: user.userId,
    web3UserName: user.web3UserName,
    DiD: user.DiD,
    isActiveUser: user.isActiveUser,
    isEarlyUser: user.isEarlyUser,
    activeClanId: user.activeClanId,
    socialHandlesCount: user.socialHandles?.length || 0,
    walletsCount: user.wallets?.length || 0,
    createdAt: user.createdAt
  }));
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    filter: status,
    data: simplifiedUsers,
    pagination: {
      total,
      page,
      pages,
      limit
    }
  });
});