import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AuthRequest } from '../types/user'; // Import from your types instead

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string;
  
  // Check if token exists in headers
  if (req.headers.authorization) {
    try {
      // Get token from header (support both with and without Bearer prefix)
      token = req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : req.headers.authorization;
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
      
      // Get user from token
      const user = await User.findOne({ where: { userId: decoded.id } });
      
      if (!user) {
        return next(new AppError('User not found', HTTP_STATUS.UNAUTHORIZED));
      }
      
      // Attach user to request object (only the parts needed for AuthRequest)
      (req as AuthRequest).user = {
        userId: user.userId,
        web3UserName: user.web3UserName
      };
      
      next();
    } catch (error) {
      console.error(error);
      return next(new AppError('Not authorized, token failed', HTTP_STATUS.UNAUTHORIZED));
    }
  } else {
    return next(new AppError('Not authorized, no token', HTTP_STATUS.UNAUTHORIZED));
  }
};

/**
 * Middleware to ensure inactive users cannot access protected resources
 */
export const active = async (req: Request, res: Response, next: NextFunction) => {
  // First get the full user record since AuthRequest only has userId and web3UserName
  const authReq = req as AuthRequest;
  if (!authReq.user?.userId) {
    return next(new AppError('Not authorized', HTTP_STATUS.UNAUTHORIZED));
  }
  
  const user = await User.findOne({ where: { userId: authReq.user.userId } });
  
  if (user && user.isActiveUser) {
    next();
  } else {
    return next(new AppError('Account is inactive, please contact support', HTTP_STATUS.FORBIDDEN));
  }
};