"use strict";
// import axios from 'axios';
// import crypto from 'crypto';
// import jwt from 'jsonwebtoken';
// import { TwitterTokenResponse, TwitterUserResponse, TwitterUserDTO, TwitterEmailResponse } from '../types/twitterAuth';
// import { AppError } from '../utils/error-handler';
// import { HTTP_STATUS } from '../constants/http-status';
// import TwitterAuthRepository from '../repositories/twitterAuthRepository';
// // Twitter API credentials
// const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
// const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';
// const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/api/auth/twitter/callback';
// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
//   console.error('Missing required Twitter API credentials');
// }
// class TwitterAuthService {
//   private readonly authURL = 'https://twitter.com/i/oauth2/authorize';
//   private readonly tokenURL = 'https://api.twitter.com/2/oauth2/token';
//   private readonly userURL = 'https://api.twitter.com/2/users/me';
//   private readonly emailURL = 'https://api.twitter.com/2/users/me?user.fields=verified,profile_image_url';
//   // Generate auth URL for client redirection
//   generateAuthUrl(): { url: string, state: string } {
//     // Generate a random state for CSRF protection
//     const state = crypto.randomBytes(16).toString('hex');
//     // Create Twitter OAuth URL with required parameters
//     const url = new URL(this.authURL);
//     url.searchParams.append('response_type', 'code');
//     url.searchParams.append('client_id', TWITTER_CLIENT_ID);
//     url.searchParams.append('redirect_uri', TWITTER_REDIRECT_URI);
//     url.searchParams.append('scope', 'tweet.read users.read tweet.write offline.access');
//     url.searchParams.append('state', state);
//     url.searchParams.append('code_challenge', 'challenge'); // For PKCE
//     url.searchParams.append('code_challenge_method', 'plain');
//     return { url: url.toString(), state };
//   }
//   // Exchange authorization code for tokens
//   async getTokensFromCode(code: string): Promise<TwitterTokenResponse> {
//     try {
//       // Basic auth with client ID and secret
//       const auth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
//       const response = await axios.post(
//         this.tokenURL,
//         new URLSearchParams({
//           code,
//           grant_type: 'authorization_code',
//           client_id: TWITTER_CLIENT_ID,
//           redirect_uri: TWITTER_REDIRECT_URI,
//           code_verifier: 'challenge' // For PKCE (should match challenge)
//         }),
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': `Basic ${auth}`
//           }
//         }
//       );
//       return response.data as TwitterTokenResponse;
//     } catch (error) {
//       console.error('Error exchanging code for tokens:', error);
//       if ((error as any).isAxiosError && (error as any).response) {
//         console.error('Twitter API error details:', (error as any).response.data);
//         throw new AppError(`Twitter API error: ${(error as any).response.data.title || (error as any).response.data.detail || 'Unknown error'}`, 
//         (error as any).response.data.status || HTTP_STATUS.INTERNAL_SERVER_ERROR);
//       }
//       if (error instanceof AppError) {
//         throw error; // rethrow custom app errors
//       }
//       throw new AppError('Failed to exchange authorization code for tokens', HTTP_STATUS.INTERNAL_SERVER_ERROR);
//     }
//   }
//   // Get user info with access token
//   async getUserInfo(accessToken: string): Promise<TwitterUserDTO> {
//     try {
//       // Get basic user data
//       const userResponse = await axios.get<TwitterUserResponse>(this.userURL, {
//         headers: {
//           'Authorization': `Bearer ${accessToken}`
//         },
//         params: {
//           'user.fields': 'profile_image_url'
//         }
//       });
//       const userData = userResponse.data;
//       if (!userData.data || !userData.data.id) {
//         throw new AppError('Invalid user data received from Twitter', HTTP_STATUS.BAD_REQUEST);
//       }
//       // Get email data (this might not always be available)
//       let email: string | undefined;
//       try {
//         const emailResponse = await axios.get(this.emailURL, {
//           headers: {
//             'Authorization': `Bearer ${accessToken}`
//           }
//         });
//         const emailData: TwitterEmailResponse = emailResponse.data as TwitterEmailResponse;
//         if (emailData.data && emailData.data.email) {
//           email = emailData.data.email;
//         }
//       } catch (emailError) {
//         console.warn('Could not retrieve Twitter email:', emailError);
//         // Continue without email
//       }
//       // Create user DTO
//       const user: TwitterUserDTO = {
//         twitterId: userData.data.id,
//         username: userData.data.username,
//         displayName: userData.data.name,
//         email: email,
//         profilePicture: userData.data.profile_image_url
//       };
//       return user;
//     } catch (error) {
//       console.error('Error getting user info from Twitter:', error);
//       if ((error as any).isAxiosError && (error as any).response) {
//         console.error('Twitter API error details userInfo:', (error as any).response.data);
//         throw new AppError(`Twitter API error: ${(error as any).response.data.title || (error as any).response.data.detail || 'Unknown error'}`, 
//           (error as any).response.data.status || HTTP_STATUS.INTERNAL_SERVER_ERROR);
//       }
//       if (error instanceof AppError) {
//         throw error; // rethrow custom app errors
//       }
//       throw new AppError('Failed to get user info from Twitter', HTTP_STATUS.INTERNAL_SERVER_ERROR);
//     }
//   }
//   // Generate an access token
//   generateAccessToken(twitterId: string, username: string): string {
//     return jwt.sign(
//       { id: twitterId, username, provider: 'twitter' },
//       JWT_SECRET,
//       { expiresIn: '15m' }
//     );
//   }
//   // Generate a refresh token
//   generateRefreshToken(twitterId: string, username: string): string {
//     return jwt.sign(
//       { id: twitterId, username, provider: 'twitter' },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );
//   }
//   // Handle the complete Twitter auth flow
//   async handleTwitterCallback(code: string): Promise<{ 
//     user: TwitterUserDTO, 
//     accessToken: string, 
//     refreshToken: string,
//     twitterTokens: { 
//       access_token: string, 
//       refresh_token?: string,
//       expires_in: number
//     } 
//   }> {
//     try {
//       // Step 1: Get tokens from Twitter
//       const tokenResponse = await this.getTokensFromCode(code);
//       const { access_token, refresh_token, expires_in } = tokenResponse;
//       // Step 2: Get user info from Twitter
//       const user = await this.getUserInfo(access_token);
//       console.log('Existing user handle:', user);
//       // Step 3: Check if user already exists
//       const existingSocialHandle = await TwitterAuthRepository.findBySocialId(user.twitterId);
//       let appUser;
//        console.log('Existing social handle:', existingSocialHandle);
//       if (existingSocialHandle?.userId) {
//         // Existing user - update tokens and profile info
//         appUser = await TwitterAuthRepository.updateUserWeb(existingSocialHandle.userId, {
//           twitterAccessToken: access_token,
//           twitterRefreshToken: refresh_token
//         });
//         await TwitterAuthRepository.updateUserSocialHandle(existingSocialHandle.id, {
//           username: user.username,
//           displayName: user.displayName,
//           email: user.email,
//           profilePicture: user.profilePicture
//         });
//       } else {
//         // New user - create user and social handle
//         appUser = await TwitterAuthRepository.createUserWeb({
//           web3UserName: `${user.username}_${new Date()}`,
//           twitterAccessToken: access_token,
//           twitterRefreshToken: refresh_token,
//           isActiveUser: true
//         });
//         await TwitterAuthRepository.createUserSocialHandle({
//           userId: appUser.userId,
//           provider: 'twitter',
//           socialId: user.twitterId,
//           username: user.username,
//           displayName: user.displayName,
//           email: user.email,
//           profilePicture: user.profilePicture
//         });
//       }
//       // Step 4: Generate App Tokens
//       const jwtAccessToken = this.generateAccessToken(user.twitterId, user.username);
//       const jwtRefreshToken = this.generateRefreshToken(user.twitterId, user.username);
//       return {
//         user,
//         accessToken: jwtAccessToken,
//         refreshToken: jwtRefreshToken,
//         twitterTokens: {
//           access_token,
//           refresh_token,
//           expires_in
//         }
//       };
//     } catch (error) {
//       console.error('Twitter callback error:', error);
//       if (error instanceof AppError) {
//         throw error; // rethrow custom app errors
//       }
//       throw new AppError('Failed to handle Twitter callback', HTTP_STATUS.INTERNAL_SERVER_ERROR);
//     }
//   }
//   // For testing purposes only - no Twitter API access
//   async testMockAuth(mockData: {
//     twitterId: string;
//     username: string;
//     displayName: string;
//     email?: string;
//     profilePicture?: string;
//   }): Promise<{ user: TwitterUserDTO, accessToken: string, refreshToken: string }> {
//     try {
//       const { twitterId, username, displayName, email, profilePicture } = mockData;
//       // Create user object
//       const user: TwitterUserDTO = {
//         twitterId,
//         username,
//         displayName,
//         email,
//         profilePicture
//       };
//       // Generate JWT tokens
//       const accessToken = this.generateAccessToken(twitterId, username);
//       const refreshToken = this.generateRefreshToken(twitterId, username);
//       return { user, accessToken, refreshToken };
//     } catch (error) {
//       console.error('Error in mock authentication:', error);
//       throw new AppError('Mock authentication failed', HTTP_STATUS.BAD_REQUEST);
//     }
//   }
//   // Refresh an expired access token
//   async refreshAccessToken(refreshToken: string): Promise<{
//     access_token: string;
//     refresh_token?: string;
//     expires_in: number;
//   }> {
//     try {
//       const auth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
//       const response = await axios.post(
//         this.tokenURL,
//         new URLSearchParams({
//           grant_type: 'refresh_token',
//           refresh_token: refreshToken
//         }),
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Authorization': `Basic ${auth}`
//           }
//         }
//       );
//       return {
//         access_token: (response.data as { access_token: string }).access_token,
//         refresh_token: (response.data as { refresh_token?: string }).refresh_token,
//         expires_in: (response.data as { expires_in: number }).expires_in
//       };
//     } catch (error) {
//       console.error('Error refreshing access token:', error);
//       if ((error as any).isAxiosError && (error as any).response) {
//         throw new AppError(`Failed to refresh access token: ${(error as any).response.data?.error || 'Unknown error'}`, 
//           (error as any).response.status || HTTP_STATUS.INTERNAL_SERVER_ERROR);
//       }
//       throw new AppError('Failed to refresh access token', HTTP_STATUS.INTERNAL_SERVER_ERROR);
//     }
//   }
// }
// export default new TwitterAuthService();
const twitter_api_v2_1 = require("twitter-api-v2");
const uuid_1 = require("uuid");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const twitterAuthRepository_1 = __importDefault(require("../repositories/twitterAuthRepository"));
class TwitterAuthV2Service {
    // Complete Twitter authentication process
    async completeAuthentication(tempToken, verifier, stored) {
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_KEY,
            appSecret: process.env.TWITTER_CONSUMER_SECRET,
            accessToken: stored.accessToken,
            accessSecret: stored.accessSecret,
        });
        try {
            // Login and get the authenticated client
            const { accessToken, accessSecret, client: loggedClient, } = await client.login(verifier);
            // Get the user information
            const user = await loggedClient.currentUser();
            return {
                user,
                accessToken,
                accessSecret
            };
        }
        catch (error) {
            console.error('Twitter authentication error:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Authentication failed', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Find or create user in database
    async findOrCreateUser(twitterUser, accessToken, accessSecret) {
        try {
            // Check if user already exists
            const existingUser = await twitterAuthRepository_1.default.findBySocialId(twitterUser.id_str);
            if (existingUser) {
                // Update existing user with new tokens
                await twitterAuthRepository_1.default.updateTokens(existingUser.userId, accessToken, accessSecret);
                return {
                    userId: existingUser.userId,
                    isNewUser: false
                };
            }
            // Create new user and social handle
            const userId = (0, uuid_1.v4)();
            // Create user - store Twitter tokens in the User model
            await twitterAuthRepository_1.default.createUser({
                userId,
                web3UserName: `${twitterUser.screen_name}_${Date.now()}`,
                twitterAccessToken: accessToken,
                twitterRefreshToken: accessSecret, // Store accessSecret as refreshToken
                isActiveUser: true
            });
            // Create social handle - without tokens (they're stored in User model)
            await twitterAuthRepository_1.default.createSocialHandle({
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
        }
        catch (error) {
            console.error('Error finding/creating user:', error);
            throw error;
        }
    }
    // Post a tweet
    async postTweet(userId, text, mediaId) {
        try {
            // Get user's tokens from User model
            const user = await twitterAuthRepository_1.default.findUserById(userId);
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                throw new error_handler_1.AppError('User not authenticated with Twitter', http_status_1.HTTP_STATUS.UNAUTHORIZED);
            }
            // Create Twitter client with user's tokens
            const client = new twitter_api_v2_1.TwitterApi({
                appKey: process.env.TWITTER_CONSUMER_KEY,
                appSecret: process.env.TWITTER_CONSUMER_SECRET,
                accessToken: user.twitterAccessToken,
                accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
            });
            // Prepare tweet payload
            const tweetPayload = { text };
            // Add media if provided
            if (mediaId) {
                tweetPayload.media = { media_ids: [mediaId] };
            }
            // Post the tweet
            const tweet = await client.v2.tweet(tweetPayload);
            return tweet;
        }
        catch (error) {
            console.error('Error posting tweet:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to post tweet', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Upload media
    async uploadMedia(userId, mediaBuffer, mimeType = 'image/jpeg') {
        try {
            // Get user's tokens from User model
            const user = await twitterAuthRepository_1.default.findUserById(userId);
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                throw new error_handler_1.AppError('User not authenticated with Twitter', http_status_1.HTTP_STATUS.UNAUTHORIZED);
            }
            // Create Twitter client with user's tokens
            const client = new twitter_api_v2_1.TwitterApi({
                appKey: process.env.TWITTER_CONSUMER_KEY,
                appSecret: process.env.TWITTER_CONSUMER_SECRET,
                accessToken: user.twitterAccessToken,
                accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
            });
            // Upload the media
            const mediaId = await client.v1.uploadMedia(mediaBuffer, { mimeType });
            return mediaId;
        }
        catch (error) {
            console.error('Error uploading media:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to upload media', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Verify user credentials
    async verifyCredentials(userId) {
        try {
            // Get user's tokens from User model
            const user = await twitterAuthRepository_1.default.findUserById(userId);
            if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
                throw new error_handler_1.AppError('User not authenticated with Twitter', http_status_1.HTTP_STATUS.UNAUTHORIZED);
            }
            // Create Twitter client with user's tokens
            const client = new twitter_api_v2_1.TwitterApi({
                appKey: process.env.TWITTER_CONSUMER_KEY,
                appSecret: process.env.TWITTER_CONSUMER_SECRET,
                accessToken: user.twitterAccessToken,
                accessSecret: user.twitterRefreshToken, // Using the refresh token as access secret
            });
            // Verify credentials by getting current user
            const twitterUser = await client.currentUser();
            return twitterUser;
        }
        catch (error) {
            console.error('Error verifying credentials:', error);
            throw new error_handler_1.AppError(error instanceof Error ? error.message : 'Failed to verify Twitter credentials', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = new TwitterAuthV2Service();
//# sourceMappingURL=twitterAuthService.js.map