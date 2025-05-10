import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

// Validate UUID format
export const validateUUID = (idParam: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[idParam] || req.body[idParam];
    
    if (!id) {
      return next(new AppError(`${idParam} is required.`, HTTP_STATUS.BAD_REQUEST));
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return next(new AppError(`Invalid ${idParam} format.`, HTTP_STATUS.BAD_REQUEST));
    }
    
    next();
  };
};

// Validate clan join request body
export const validateJoinClanRequest = (req: Request, res: Response, next: NextFunction) => {
  const { userId, clanId } = req.body;
  
  if (!userId) {
    return next(new AppError('User ID is required.', HTTP_STATUS.BAD_REQUEST));
  }
  
  if (!clanId) {
    return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(userId)) {
    return next(new AppError('Invalid User ID format.', HTTP_STATUS.BAD_REQUEST));
  }
  
  if (!uuidRegex.test(clanId)) {
    return next(new AppError('Invalid Clan ID format.', HTTP_STATUS.BAD_REQUEST));
  }
  
  next();
};