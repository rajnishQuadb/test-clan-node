import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import twitterAuthService from '../services/twitterAuthService';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { TwitterAuthRequest, TwitterProfile, TwitterTokens } from '../types/twitterAuth';
import { encryptData } from '../utils/encryption';

// Initiate Twitter authentication
export const twitterLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('twitter')(req, res, next);
};

// Handle Twitter callback
export const twitterCallback = catchAsync(async (req: TwitterAuthRequest, res: Response, next: NextFunction) => {
  passport.authenticate('twitter', { session: false }, async (err: Error | null, data: any, info: any) => {
    if (err) {
      console.error('Twitter authentication error:', err);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Authentication failed' 
      });
    }
    
    if (!data || !data.profile) {
      console.error('Twitter authentication failed - no user data:', info);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        success: false, 
        message: 'Authentication failed - no user data' 
      });
    }
    
    try {
      const { profile, tokens } = data;
      const { user, accessToken, refreshToken } = await twitterAuthService.handleTwitterCallback(
        profile as TwitterProfile, 
        tokens as TwitterTokens
      );
      
      // Prepare response
      const responseData = {
        success: true,
        user: {
          twitterId: user.twitterId,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          profilePicture: user.profilePicture
        },
        access_token: accessToken,
        refresh_token: refreshToken
      };
      
      // Encrypt if needed
      if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
          const encryptedData = encryptData(responseData);
          return res.status(HTTP_STATUS.OK).json({
            encrypted: true,
            data: encryptedData
          });
        } catch (error) {
          console.error('Encryption error:', error);
          // Fall back to unencrypted response
        }
      }
      
      res.status(HTTP_STATUS.OK).json(responseData);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// For testing only - test Twitter authentication without real Twitter auth
export const twitterTestAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Endpoint not available in production'
    });
  }
  
  const mockData = {
    twitterId: req.body.twitterId || '123456789',
    username: req.body.username || 'test_twitter_user',
    displayName: req.body.displayName || 'Test Twitter User',
    email: req.body.email,
    profilePicture: req.body.profilePicture || 'https://example.com/default-twitter.png'
  };
  
  const { user, accessToken, refreshToken } = await twitterAuthService.testMockAuth(mockData);
  
  // Prepare response
  const responseData = {
    success: true,
    user: {
      twitterId: user.twitterId,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture
    },
    access_token: accessToken,
    refresh_token: refreshToken
  };
  
  // Encrypt if needed
  if (process.env.ENCRYPT_RESPONSES === 'true') {
    try {
      const encryptedData = encryptData(responseData);
      return res.status(HTTP_STATUS.OK).json({
        encrypted: true,
        data: encryptedData
      });
    } catch (error) {
      console.error('Encryption error:', error);
      // Fall back to unencrypted response
    }
  }
  
  res.status(HTTP_STATUS.OK).json(responseData);
});