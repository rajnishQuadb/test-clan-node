
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import TwitterAuthService from '../services/twitterAuthService';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { encryptData } from '../utils/encryption';
import userService from '../services/userService';
import { AppError } from '../utils/error-handler';
import User from '../models/User'; // Add User model import
import UserSocialHandle from '../models/UserSocialHandle'; // Add UserSocialHandle model import


declare global {
  namespace Express {
    interface ExpressUser extends User {
      id: string; // Add the id property to the existing User type
    }

    interface User {
      id?: string; // Ensure the 'id' property is optional on the User type
    }
  }
}

// Initiate Twitter OAuth flow by generating auth URL
export const twitterLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { url, state } = TwitterAuthService.generateAuthUrl();
  
  // Store state in session/cookie for CSRF protection verification
  req.session.twitterState = state;
  res.redirect(url);
  // res.status(HTTP_STATUS.OK).json({ url });
});

// Handle Twitter OAuth callback
export const twitterCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, state } = req.query;

  // Verify state parameter to prevent CSRF attacks
  if (!state || state !== req.session.twitterState) {
    throw new AppError('Invalid state parameter', HTTP_STATUS.BAD_REQUEST);
  }

  if (!code || typeof code !== 'string') {
    throw new AppError('No authorization code provided', HTTP_STATUS.BAD_REQUEST);
  }

  // Process OAuth callback
  const { user, accessToken, refreshToken, twitterTokens } = await TwitterAuthService.handleTwitterCallback(code);

  // Look up the user's ID from the UserSocialHandle table
  let userId = null;
  try {
    // Find the UserSocialHandle entry for this Twitter ID
    const socialHandle = await UserSocialHandle.findOne({
      where: { 
        provider: 'twitter', 
        socialId: user.twitterId 
      }
    });

    if (socialHandle) {
      userId = socialHandle.userId;
    } else {
      console.log('No UserSocialHandle found for Twitter ID:', user.twitterId);
    }
  } catch (error) {
    console.error('Error finding UserSocialHandle:', error);
  }

  // Prepare response with userId included
  const responseData = {
    success: true,
    user: {
      userId: userId, // Include the userId in the response
      twitterId: user.twitterId,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
    twitter_tokens: {
      access_token: twitterTokens.access_token,
      refresh_token: twitterTokens.refresh_token,
      expires_in: twitterTokens.expires_in
    }
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
  res.redirect(`https://clans-landing.10on10studios.com/startRoaring/${userId}`);
  // res.status(HTTP_STATUS.OK).json(responseData);
});

// For testing only
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
  
  const { user, accessToken, refreshToken } = await TwitterAuthService.testMockAuth(mockData);
  
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

// Refresh Twitter access token
export const refreshTwitterToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST);
  }
  
  const tokens = await TwitterAuthService.refreshAccessToken(refresh_token);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    ...tokens
  });
});

