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

  console.log("OAuth Token : ", oauth_token);
  console.log("OAuth Verifier : ", oauth_verifier);

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
  const { userId, text, mediaId, referralCode } = req.body;
  console.log("Received request to post tweet:", { userId, text, mediaId });

  if (!userId || !text) {
    throw new AppError('Missing required parameters', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const tweetResponse = await TwitterAuthV2Service.postTweet(userId, text, mediaId, referralCode);
    
    // Print the entire tweet response to console
    console.log("Twitter API Response:", JSON.stringify(tweetResponse, null, 2));
    
    // Check if redirectUrl is provided in the request
    const redirectUrl = req.body.redirectUrl || `${process.env.FRONTEND_URL || 'https://clans-landing.10on10studios.com'}/CardPage`;
    
    // Add tweet data to URL as query parameters
    const redirectWithData = new URL(redirectUrl);
    // Access the tweet ID correctly from the Twitter API v2 response structure
    const tweetId = tweetResponse.tweet?.data?.id || '';
    console.log("Extracted Tweet ID:", tweetId);
    
    redirectWithData.searchParams.append('tweetId', tweetId);
    redirectWithData.searchParams.append('userId', userId);
    
    // Return the full tweet response if no redirect is needed
    if (req.query.noRedirect === 'true') {
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        tweet: tweetResponse,
        tweetId: tweetId,
        redirectUrl: redirectWithData.toString()
      });
    }
    
    // Redirect to frontend with tweet data
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      tweet: tweetResponse,
      tweetId: tweetId,
      redirectUrl: redirectWithData.toString()
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