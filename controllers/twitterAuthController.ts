
// import { Request, Response, NextFunction } from 'express';
// import axios from 'axios';
// import TwitterAuthService from '../services/twitterAuthService';
// import { catchAsync } from '../utils/error-handler';
// import { HTTP_STATUS } from '../constants/http-status';
// import { encryptData } from '../utils/encryption';
// import userService from '../services/userService';
// import { AppError } from '../utils/error-handler';
// import User from '../models/User'; // Add User model import
// import UserSocialHandle from '../models/UserSocialHandle'; // Add UserSocialHandle model import


// declare global {
//   namespace Express {
//     interface ExpressUser extends User {
//       id: string; // Add the id property to the existing User type
//     }

//     interface User {
//       id?: string; // Ensure the 'id' property is optional on the User type
//     }
//   }
// }

// // Initiate Twitter OAuth flow by generating auth URL
// export const twitterLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { url, state } = TwitterAuthService.generateAuthUrl();
  
//   // Store state in session/cookie for CSRF protection verification
//   req.session.twitterState = state;
//   res.redirect(url);
//   // res.status(HTTP_STATUS.OK).json({ url });
// });

// // Handle Twitter OAuth callback
// export const twitterCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { code, state } = req.query;

//   // Verify state parameter to prevent CSRF attacks
//   if (!state || state !== req.session.twitterState) {
//     throw new AppError('Invalid state parameter', HTTP_STATUS.BAD_REQUEST);
//   }

//   if (!code || typeof code !== 'string') {
//     throw new AppError('No authorization code provided', HTTP_STATUS.BAD_REQUEST);
//   }

//   // Process OAuth callback
//   const { user, accessToken, refreshToken, twitterTokens } = await TwitterAuthService.handleTwitterCallback(code);

//   // Look up the user's ID from the UserSocialHandle table
//   let userId = null;
//   try {
//     // Find the UserSocialHandle entry for this Twitter ID
//     const socialHandle = await UserSocialHandle.findOne({
//       where: { 
//         provider: 'twitter', 
//         socialId: user.twitterId 
//       }
//     });

//     if (socialHandle) {
//       userId = socialHandle.userId;
//     } else {
//       console.log('No UserSocialHandle found for Twitter ID:', user.twitterId);
//     }
//   } catch (error) {
//     console.error('Error finding UserSocialHandle:', error);
//   }

//   // Prepare response with userId included
//   const responseData = {
//     success: true,
//     user: {
//       userId: userId, // Include the userId in the response
//       twitterId: user.twitterId,
//       username: user.username,
//       displayName: user.displayName,
//       email: user.email,
//       profilePicture: user.profilePicture,
//     },
//     access_token: accessToken,
//     refresh_token: refreshToken,
//     twitter_tokens: {
//       access_token: twitterTokens.access_token,
//       refresh_token: twitterTokens.refresh_token,
//       expires_in: twitterTokens.expires_in
//     }
//   };

//   // Encrypt if needed
//   if (process.env.ENCRYPT_RESPONSES === 'true') {
//     try {
//       const encryptedData = encryptData(responseData);
//       return res.status(HTTP_STATUS.OK).json({
//         encrypted: true,
//         data: encryptedData
//       });
//     } catch (error) {
//       console.error('Encryption error:', error);
//       // Fall back to unencrypted response
//     }
//   }
//   res.redirect(`https://clans-landing.10on10studios.com/startRoaring/${userId}`);
//   // res.status(HTTP_STATUS.OK).json(responseData);
// });

// // For testing only
// export const twitterTestAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   if (process.env.NODE_ENV !== 'development') {
//     return res.status(HTTP_STATUS.NOT_FOUND).json({
//       success: false,
//       message: 'Endpoint not available in production'
//     });
//   }
  
//   const mockData = {
//     twitterId: req.body.twitterId || '123456789',
//     username: req.body.username || 'test_twitter_user',
//     displayName: req.body.displayName || 'Test Twitter User',
//     email: req.body.email,
//     profilePicture: req.body.profilePicture || 'https://example.com/default-twitter.png'
//   };
  
//   const { user, accessToken, refreshToken } = await TwitterAuthService.testMockAuth(mockData);
  
//   // Prepare response
//   const responseData = {
//     success: true,
//     user: {
//       twitterId: user.twitterId,
//       username: user.username,
//       displayName: user.displayName,
//       email: user.email,
//       profilePicture: user.profilePicture
//     },
//     access_token: accessToken,
//     refresh_token: refreshToken
//   };
  
//   // Encrypt if needed
//   if (process.env.ENCRYPT_RESPONSES === 'true') {
//     try {
//       const encryptedData = encryptData(responseData);
//       return res.status(HTTP_STATUS.OK).json({
//         encrypted: true,
//         data: encryptedData
//       });
//     } catch (error) {
//       console.error('Encryption error:', error);
//       // Fall back to unencrypted response
//     }
//   }
  
//   res.status(HTTP_STATUS.OK).json(responseData);
// });

// // Refresh Twitter access token
// export const refreshTwitterToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { refresh_token } = req.body;
  
//   if (!refresh_token) {
//     throw new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST);
//   }
  
//   const tokens = await TwitterAuthService.refreshAccessToken(refresh_token);
  
//   res.status(HTTP_STATUS.OK).json({
//     success: true,
//     ...tokens
//   });
// });



import { Request, Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../utils/error-handler';
import TwitterAuthV2Service from '../services/twitterAuthService';
import User from '../models/User';
import UserSocialHandle from '../models/UserSocialHandle';

// In-memory store for temporary tokens (should be moved to Redis or DB in production)
const temporaryTokenStore = new Map<
  string, 
  { 
    accessToken: string; 
    accessSecret: string; 
    state?: string; 
  }
>();

// Initiate Twitter OAuth flow
export const twitterLoginV2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Initialize Twitter client
  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
  });

  // Generate Twitter auth link
  const { url, oauth_token, oauth_token_secret } = 
    await client.generateAuthLink(process.env.TWITTER_CALLBACK_URL!);

  // Store tokens temporarily
  temporaryTokenStore.set(oauth_token, {
    accessToken: oauth_token,
    accessSecret: oauth_token_secret,
  });

  console.log("Redirecting to Twitter:", url);
  
  // Redirect user to Twitter authorization page
  res.redirect(url);
});

// Handle Twitter OAuth callback
export const twitterCallbackV2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { oauth_token, oauth_verifier } = req.query;

  if (!oauth_token || !oauth_verifier) {
    throw new AppError('Missing OAuth parameters', HTTP_STATUS.BAD_REQUEST);
  }

  const tempToken = oauth_token as string;
  const verifier = oauth_verifier as string;
  const stored = temporaryTokenStore.get(tempToken);

  if (!stored) {
    throw new AppError('Invalid or expired token', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    // Complete the authentication process
    const { user, accessToken, accessSecret } = 
      await TwitterAuthV2Service.completeAuthentication(tempToken, verifier, stored);

    // Look up or create user in the database
    const { userId, isNewUser } = await TwitterAuthV2Service.findOrCreateUser(user, accessToken, accessSecret);

    // Prepare response data
    const responseData = {
      success: true,
      user: {
        userId,
        twitterId: user.id_str,
        username: user.screen_name,
        displayName: user.name,
        profilePicture: user.profile_image_url_https,
        isNewUser
      },
      tokens: {
        accessToken,
        accessSecret
      }
    };

    // Clean up temporary token store
    temporaryTokenStore.delete(tempToken);

    // Redirect to frontend with userId
    res.redirect(`${process.env.FRONTEND_URL || 'https://clans-landing.10on10studios.com'}/startRoaring/${userId}`);
  } catch (error) {
    console.error('Twitter authentication error:', error);
    next(error);
  }
});

// Test endpoint to tweet
export const postTweet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, text, mediaId , referralCode} = req.body;
  console.log("Received request to post tweet:", { userId, text, mediaId });

  if (!userId || !text) {
    throw new AppError('Missing required parameters', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const tweet = await TwitterAuthV2Service.postTweet(userId, text, mediaId , referralCode);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      tweet
    });
  } catch (error) {
    console.error('Error posting tweet:', error);
    next(error);
  }
});

// Upload media
export const uploadMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const media = req.file;

  if (!userId || !media) {
    throw new AppError('Missing required parameters', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const mediaId = await TwitterAuthV2Service.uploadMedia(userId, media.buffer);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      mediaId
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    next(error);
  }
});

// Verify a user's tokens (for testing)
export const verifyCredentials = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  if (!userId) {
    throw new AppError('User ID is required', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const user = await TwitterAuthV2Service.verifyCredentials(userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error verifying credentials:', error);
    next(error);
  }
});