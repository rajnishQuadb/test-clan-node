
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
  
  
  // Prepare response
  const responseData = {
    success: true,
    user: {
      twitterId: user.twitterId,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture,

    },
    access_token: accessToken,
    refresh_token: refreshToken,
    twitter_tokens: {                 // Add this!
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
  
  res.status(HTTP_STATUS.OK).json(responseData);
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

// In your twitterAuthController.ts file, add this method:



// ... other controller functions ...


// Rest of your controller functions...

export const postTweet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get the tweet text from the request
  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    throw new AppError('Tweet text is required', HTTP_STATUS.BAD_REQUEST);
  }
  
  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    throw new AppError('User authentication required', HTTP_STATUS.UNAUTHORIZED);
  }
  
  // Get the user ID from the JWT token
  const userId = req.user.id;
  
  // Retrieve the user's Twitter access token from your database
  const user = await User.findOne({
    where: { userId },
    include: [{
      model: UserSocialHandle,
      as: 'socialHandles',
      where: { provider: 'twitter' }
    }]
  });
  
  if (!user || !user.twitterAccessToken) {
    throw new AppError('Twitter access token not found for this user', HTTP_STATUS.NOT_FOUND);
  }
  
  try {
    // Make a request to the Twitter API
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      {
        headers: {
          'Authorization': `Bearer ${user.twitterAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      tweet: response.data
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    
    // Use axios.isAxiosError or instanceof
    // if (axios.isAxiosError(error) && error.response) {
    //   throw new AppError(
    //     `Twitter API error: ${JSON.stringify(error.response.data)}`, 
    //     HTTP_STATUS.BAD_REQUEST
    //   );
    // }
    
    throw new AppError('Failed to post tweet', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Add this to twitterAuthController.ts
export const directTweet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get the tweet text and token from the request
  const { text, twitter_access_token } = req.body;
  
  if (!text || typeof text !== 'string') {
    throw new AppError('Tweet text is required', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (!twitter_access_token) {
    throw new AppError('Twitter access token is required', HTTP_STATUS.BAD_REQUEST);
  }
  
  try {
    // Make a request directly to the Twitter API with the provided token
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      { text },
      {
        headers: {
          'Authorization': `Bearer ${twitter_access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      tweet: response.data
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    
    // if (axios.isAxiosError && error.response) {
    //   console.error('Twitter API error details:', error.response.data);
    //   throw new AppError(
    //     `Twitter API error: ${JSON.stringify(error.response.data)}`, 
    //     HTTP_STATUS.BAD_REQUEST
    //   );
    // }
    
    throw new AppError('Failed to post tweet', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});