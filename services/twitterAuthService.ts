
import { TwitterApi } from 'twitter-api-v2';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import TwitterAuthV2Repository from '../repositories/twitterAuthRepository';
import userRepository from '../repositories/userRepository';
class TwitterAuthV2Service {
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
      throw new AppError('Failed to exchange authorization code for tokens', HTTP_STATUS.INTERNAL_SERVER_ERROR);
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
      

      // Create new user and social handle
      const userId = uuidv4();
      
      // Create user - store Twitter tokens in the User model
      await TwitterAuthV2Repository.createUser({
        userId,
        web3UserName: `${twitterUser.screen_name}_${Date.now()}`,
        twitterAccessToken: accessToken,
        twitterRefreshToken: accessSecret, // Store accessSecret as refreshToken
        isActiveUser: true
      });
      
      // Create social handle - without tokens (they're stored in User model)
      await TwitterAuthV2Repository.createSocialHandle({
        userId,
        provider: 'twitter',
        socialId: twitterUser.id_str,
        username: twitterUser.screen_name,
        displayName: twitterUser.name,
        profilePicture: twitterUser.profile_image_url_https,
        email: twitterUser.email // Include email if available
      });
      
      return {
        userId,
        isNewUser: true
      };
    } catch (error) {
      console.error('Error finding/creating user:', error);
      throw error;
    }
  }
  
  // Post a tweet
  async postTweet(userId: string, text: string, mediaId?: string , referralCode?: string) {
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

      if (tweet?.data?.id && referralCode) {
              const referrer = await userRepository.findUserByReferralCode(referralCode);
              if (!referrer) {
                throw new AppError('Invalid referral code', HTTP_STATUS.BAD_REQUEST);
              }
      
              await userRepository.createReferral({
                referrerUserId: referrer.userId,
                referredUserId: userId,
                referralCode,
                joinedAt: new Date(),
                rewardGiven: false,
                tweetId: tweet.data.id
              });
            }

      return {tweet , referralCode};
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
