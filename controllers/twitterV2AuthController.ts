import { Request, Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../utils/error-handler';
import TwitterAuthV2Service from '../services/twitterAuthV2Services';
import referralService from '../services/referralService';




const tempStore = new Map<
  string, 
  { 
    state: any; 
    codeVerifier: any; 
  }
>();


// Initiate Twitter OAuth flow
export const twitterLoginV2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID!, clientSecret: process.env.TWITTER_CLIENT_SECRET });

  // Generate Twitter auth link
    // await client.generateAuthLink(process.env.TWITTER_CALLBACK_URL!);
    // Don't forget to specify 'offline.access' in scope list if you want to refresh your token later
const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.TWITTER_CALLBACK_URL_V2!, { scope: ['tweet.read', 'users.read', 'media.write', 'offline.access', 'tweet.write' ] });

tempStore.set("a", {codeVerifier: codeVerifier, state: state})


  console.log("Redirecting to Twitter:", url);
  
  // Redirect user to Twitter authorization page
  res.redirect(url);
});

export const twitterCallbackV2 = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const { state, code } = req.query;
  // Get the saved codeVerifier from session
  const x = tempStore.get("a");
  const sessionState = x?.state;
  const codeVerifier = x?.codeVerifier;
  
  const referralCode = req.cookies.referral_code; // Get referral code from cookie


  if (!x?.codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  // if (state !== sessionState) {
  //   return res.status(400).send('Stored tokens didnt match!');
  // }

  // Obtain access token
  const client = new TwitterApi({ clientId: process.env.TWITTER_CLIENT_ID!, clientSecret: process.env.TWITTER_CLIENT_SECRET });

  // @ts-ignore
  client.loginWithOAuth2({ code, codeVerifier, redirectUri: process.env.TWITTER_CALLBACK_URL_V2! })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
      // {loggedClient} is an authenticated client in behalf of some user
      // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
      // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

      
      console.log("access token is ", accessToken);

      try {

        // loggedClient.v2.user()
           
        // console.log("before user");
        // // Get the user information
        console.log("logged ", loggedClient);
        // console.log("all data is ", loggedClient.);

        const userInfo = await loggedClient.v2.me({
          "user.fields": ["id", "name", "username", "profile_image_url"]
        });
        console.log("data is ", userInfo.data);

        // console.log("user is ", user)

        // // Look up or create user in the database
        const { userId, isNewUser } = await TwitterAuthV2Service.findOrCreateUser(userInfo?.data, accessToken, refreshToken!);
        if (referralCode && isNewUser) {
          await referralService.createReferral(referralCode, userId);
          // Clear the referral cookie
          res.clearCookie('referral_code');
        }
        res.redirect(`${process.env.FRONTEND_URL || 'https://clans-landing.10on10studios.com'}/startRoaring/${userId}`);
      } catch (error) {
        console.error('Twitter authentication error:', error);
        next(error);
      }
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));

});

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

  } catch (error: any) {
    // Safe error logging
    if (error?.data) {
      console.error('Twitter API Error (structured):', error.data);
    } else {
      console.error('Unknown Error posting tweet:', error);
    }
  
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



