import { Request, Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../utils/error-handler';
import TwitterAuthV2Service from '../services/twitterAuthService';
import User from '../models/User';
import UserSocialHandle from '../models/UserSocialHandle';
import referralService from '../services/referralService';

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
  const referralCode = req.cookies.referral_code; // Get referral code from cookie

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
    const { userId, isNewUser, message } = await TwitterAuthV2Service.findOrCreateUser(user, accessToken, accessSecret);
    if (!isNewUser){
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message,
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
      });
    }
    
    // Process referral if code exists and user is new
    if (referralCode && isNewUser) {
      await referralService.createReferral(referralCode, userId);
      // Clear the referral cookie
      res.clearCookie('referral_code');
    }

    // Prepare response data -- Earlier Used for app
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

// export const twitterCallbackV2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { oauth_token, oauth_verifier } = req.query;
//   const referralCode = req.cookies.referral_code;

//   if (!oauth_token || !oauth_verifier) {
//     throw new AppError('Missing OAuth parameters', HTTP_STATUS.BAD_REQUEST);
//   }

//   console.log("OAuth Token : ", oauth_token);
//   console.log("OAuth Verifier : ", oauth_verifier);

//   const tempToken = oauth_token as string;
//   const verifier = oauth_verifier as string;
//   const stored = temporaryTokenStore.get(tempToken);

//   if (!stored) {
//     throw new AppError('Invalid or expired token', HTTP_STATUS.BAD_REQUEST);
//   }

//   try {
//     // Complete the authentication process
//     const { user, accessToken, accessSecret } = 
//       await TwitterAuthV2Service.completeAuthentication(tempToken, verifier, stored);

//     // Look up or create user in the database
//     const { userId, isNewUser, message } = await TwitterAuthV2Service.findOrCreateUser(user, accessToken, accessSecret);
    
//     // Clean up temporary token store
//     temporaryTokenStore.delete(tempToken);

//     // Process referral if code exists and user is new
//     if (referralCode && isNewUser) {
//       await referralService.createReferral(referralCode, userId);
//       // Clear the referral cookie
//       res.clearCookie('referral_code');
//     }

//     // Prepare user data for response
//     const userData = {
//       userId,
//       twitterId: user.id_str,
//       username: user.screen_name,
//       displayName: user.name,
//       profilePicture: user.profile_image_url_https,
//       isNewUser
//     };

//     // For API clients, return JSON with proper message
//     if (req.headers.accept?.includes('application/json')) {
//       return res.status(HTTP_STATUS.OK).json({
//         success: true,
//         message: message || (isNewUser ? 'User created successfully' : 'Logged in successfully'),
//         user: userData,
//         tokens: { accessToken, accessSecret }
//       });
//     }

//     // For web clients, redirect with appropriate URL parameters
//     const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'https://clans-landing.10on10studios.com'}/startRoaring/${userId}`);
    
//     // Add query parameters to indicate if user already participated
//     if (!isNewUser) {
//       redirectUrl.searchParams.append('status', 'existing');
//       redirectUrl.searchParams.append('message', encodeURIComponent(message || 'User Already Participated'));
//     }

//     // Redirect to frontend
//     res.redirect(redirectUrl.toString());
//   } catch (error) {
//     console.error('Twitter authentication error:', error);
//     next(error);
//   }
// });

export const postTweet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, text, mediaId } = req.body;
  console.log("Received request to post tweet:", { userId, text, mediaId });

  if (!userId || !text) {
    throw new AppError('Missing required parameters', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const tweetResponse = await TwitterAuthV2Service.postTweet(userId, text, mediaId);
    
    // Process referral reward after successful tweet
    await referralService.processReferralAfterTweet(userId);
    
    // Print the entire tweet response to console
    console.log("Twitter API Response:", JSON.stringify(tweetResponse, null, 2));

    // Extract tweet ID from response
    const tweetId = tweetResponse?.tweet?.data?.id || null;
    console.log("Extracted Tweet ID:", tweetId);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Tweet posted successfully",
      tweetId,
      tweetData: tweetResponse?.tweet?.data || null,
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