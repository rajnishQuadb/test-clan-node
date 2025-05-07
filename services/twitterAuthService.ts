import { TwitterApi } from 'twitter-api-v2';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'; // Add this import
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import TwitterAuthV2Repository from '../repositories/twitterAuthRepository';
import userRepository from '../repositories/userRepository';
import { TwitterTokenResponse, TwitterUserResponse, TwitterUserDTO, TwitterEmailResponse } from '../types/twitterAuth';

class TwitterAuthV2Service {
  // API URLs for Twitter
  private userURL = 'https://api.twitter.com/2/users/me';
  private emailURL = 'https://api.twitter.com/2/users/me?user.fields=email';
  
  // Complete Twitter authentication process
  async completeAuthentication(
    tempToken: string, 
    verifier: string, 
    stored: { accessToken: string; accessSecret: string }
  ) {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY!,
      appSecret: process.env.TWITTER_CONSUMER_SECRET!,
      accessToken: stored.accessToken,
      accessSecret: stored.accessSecret,
    });
    
    try {
      // Login and get the authenticated client
      const {
        accessToken,
        accessSecret,
        client: loggedClient,
      } = await client.login(verifier);
      
      // Get the user information
      const user = await loggedClient.currentUser();
      
      return {
        user,
        accessToken,
        accessSecret
      };
    } catch (error) {
      console.error('Twitter authentication error:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Authentication failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // Find or create user in database
  async findOrCreateUser(
    twitterUser: any, 
    accessToken: string, 
    accessSecret: string
  ) {
    try {
      // Check if user already exists
      const existingUser = await TwitterAuthV2Repository.findBySocialId(twitterUser.id_str);
      
      if (existingUser) {
        // Update existing user with new tokens
        await TwitterAuthV2Repository.updateTokens(
          existingUser.userId,
          accessToken,
          accessSecret
        );
        
        return {
          userId: existingUser.userId,
          isNewUser: false
        };
      }
      
      // Create new user since it doesn't exist
      const userId = uuidv4();
      
      // Create user record and social handle
      await TwitterAuthV2Repository.createUser({
        userId,
        web3UserName: `${twitterUser.screen_name}_${Date.now()}`,
        twitterAccessToken: accessToken,
        twitterRefreshToken: accessSecret,
        isActiveUser: true
      });
      
      await TwitterAuthV2Repository.createSocialHandle({
        userId,
        provider: 'twitter',
        socialId: twitterUser.id_str,
        username: twitterUser.screen_name,
        displayName: twitterUser.name,
        profilePicture: twitterUser.profile_image_url_https,
        email: twitterUser.email
      });
      
      return {
        userId,
        isNewUser: true
      };
    } catch (error) {
      console.error('Error finding/creating user:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to create or find user',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // Get user info with access token
  async getUserInfo(accessToken: string): Promise<TwitterUserDTO> {
    try {
      // Get basic user data
      const userResponse = await axios.get<TwitterUserResponse>(this.userURL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          'user.fields': 'profile_image_url'
        }
      });
      
      // Extract user data from response
      const userData = userResponse.data.data;
      
      // Try to get email if possible
      let email: string | undefined;
      try {
        const emailResponse = await axios.get<TwitterEmailResponse>(this.emailURL, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        email = emailResponse.data.data.email;
      } catch (emailError) {
        console.log('Could not fetch email from Twitter:', emailError);
      }
      
      // Return user data in correct format
      return {
        twitterId: userData.id,
        username: userData.username,
        displayName: userData.name,
        profilePicture: userData.profile_image_url,
        email
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to get user info from Twitter',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // Post a tweet
  async postTweet(userId: string, text: string, mediaId?: string, referralCode?: string) {
    try {
      // Get user's tokens from User model
      const user = await TwitterAuthV2Repository.findUserById(userId);
      
      if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
        throw new AppError('User not authenticated with Twitter', HTTP_STATUS.UNAUTHORIZED);
      }
      
      // Create Twitter client with user's tokens
      const client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: user.twitterAccessToken,
        accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
      });
      
      // Prepare tweet payload
      const tweetPayload: any = { text };
      
      // Add media if provided
      if (mediaId) {
        tweetPayload.media = { media_ids: [mediaId] };
      }
      
      // Post the tweet
      const tweet = await client.v2.tweet(tweetPayload);

      // Process referral if code provided and tweet was successful
      if (tweet?.data?.id && referralCode) {
        const referrer = await userRepository.findUserByReferralCode(referralCode);
        if (!referrer) {
          console.warn(`Invalid referral code: ${referralCode}`);
        } else {
          await userRepository.createReferral({
            referrerUserId: referrer.userId,
            referredUserId: userId,
            referralCode,
            joinedAt: new Date(),
            rewardGiven: false,
            tweetId: tweet.data.id
          });
          console.log(`Referral processed for user ${userId} with code ${referralCode}`);
        }
      }

      return { tweet, referralCode };
    } catch (error) {
      console.error('Error posting tweet:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to post tweet',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  // Upload media
  async uploadMedia(userId: string, mediaBuffer: Buffer, mimeType: string = 'image/jpeg') {
    try {
      // Get user's tokens from User model
      const user = await TwitterAuthV2Repository.findUserById(userId);
      
      if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
        throw new AppError('User not authenticated with Twitter', HTTP_STATUS.UNAUTHORIZED);
      }
      
      // Create Twitter client with user's tokens
      const client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: user.twitterAccessToken,
        accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
      });
      
      // Upload the media
      const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType });
      return mediaId;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to upload media',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
  

  // Verify user credentials
  async verifyCredentials(userId: string) {
    try {
      // Get user's tokens from User model
      const user = await TwitterAuthV2Repository.findUserById(userId);
      
      if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
        throw new AppError('User not authenticated with Twitter', HTTP_STATUS.UNAUTHORIZED);
      }
      
      // Create Twitter client with user's tokens
      const client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY!,
        appSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: user.twitterAccessToken,
        accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
      });
      
      // Verify credentials by getting current user
      const twitterUser = await client.currentUser();
      return twitterUser;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw new AppError(
        error instanceof Error ? error.message : 'Failed to verify Twitter credentials',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new TwitterAuthV2Service();