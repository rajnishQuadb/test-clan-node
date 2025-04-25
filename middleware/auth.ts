import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

// Instead of using global declaration, create a local interface that extends Request
interface AuthRequest extends Request {
  user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
      const user = await User.findOne({ where: { id: decoded.id } });
      
      if (!user) {
        return next(new AppError('User not found', HTTP_STATUS.UNAUTHORIZED));
      }
      
      // Attach user to request object
      req.user = user;
      
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
export const active = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isActive) {
    next();
  } else {
    return next(new AppError('Account is inactive, please contact support', HTTP_STATUS.FORBIDDEN));
  }
};