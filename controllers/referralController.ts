import { Request, Response } from 'express';
import referralService from '../services/referralService';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AuthRequest } from '../types/user';

class ReferralController {
  // Get user's referral code and link
  getReferralCode = async(req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const referralInfo = await referralService.getReferralCode(userId);
      res.json(referralInfo);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error getting referral code:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
          message: 'Internal server error' 
        });
      }
    }
  }

  // Get referral statistics
  getReferralStats= async(req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      const stats = await referralService.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error getting referral stats:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
          message: 'Internal server error' 
        });
      }
    }
  }

  // Use a referral code
  useReferralCode = async(req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { referralCode } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!referralCode) {
        throw new AppError('Referral code is required', HTTP_STATUS.BAD_REQUEST);
      }

      const referral = await referralService.createReferral(referralCode, userId);
      res.json({ 
        message: 'Referral code applied successfully',
        referral 
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Error using referral code:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
          message: 'Internal server error' 
        });
      }
    }
  }
}

export default new ReferralController(); 