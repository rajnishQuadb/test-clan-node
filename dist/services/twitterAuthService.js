"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const twitterAuthRepository_1 = __importDefault(require("../repositories/twitterAuthRepository"));
// Twitter API credentials
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';
const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/api/auth/twitter/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    console.error('Missing required Twitter API credentials');
}
class TwitterAuthService {
    constructor() {
        this.authURL = 'https://twitter.com/i/oauth2/authorize';
        this.tokenURL = 'https://api.twitter.com/2/oauth2/token';
        this.userURL = 'https://api.twitter.com/2/users/me';
        this.emailURL = 'https://api.twitter.com/2/users/me?user.fields=verified,profile_image_url';
    }
    // Generate auth URL for client redirection
    generateAuthUrl() {
        // Generate a random state for CSRF protection
        const state = crypto_1.default.randomBytes(16).toString('hex');
        // Create Twitter OAuth URL with required parameters
        const url = new URL(this.authURL);
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', TWITTER_CLIENT_ID);
        url.searchParams.append('redirect_uri', TWITTER_REDIRECT_URI);
        url.searchParams.append('scope', 'tweet.read users.read tweet.write offline.access');
        url.searchParams.append('state', state);
        url.searchParams.append('code_challenge', 'challenge'); // For PKCE
        url.searchParams.append('code_challenge_method', 'plain');
        return { url: url.toString(), state };
    }
    // Exchange authorization code for tokens
    async getTokensFromCode(code) {
        try {
            // Basic auth with client ID and secret
            const auth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
            const response = await axios_1.default.post(this.tokenURL, new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: TWITTER_CLIENT_ID,
                redirect_uri: TWITTER_REDIRECT_URI,
                code_verifier: 'challenge' // For PKCE (should match challenge)
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error exchanging code for tokens:', error);
            if (error.isAxiosError && error.response) {
                console.error('Twitter API error details:', error.response.data);
                throw new error_handler_1.AppError(`Twitter API error: ${error.response.data?.error || 'Unknown error'}`, error.response.status || http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            throw new error_handler_1.AppError('Failed to exchange authorization code for tokens', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Get user info with access token
    async getUserInfo(accessToken) {
        try {
            // Get basic user data
            const userResponse = await axios_1.default.get(this.userURL, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    'user.fields': 'profile_image_url'
                }
            });
            const userData = userResponse.data;
            if (!userData.data || !userData.data.id) {
                throw new error_handler_1.AppError('Invalid user data received from Twitter', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Get email data (this might not always be available)
            let email;
            try {
                const emailResponse = await axios_1.default.get(this.emailURL, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const emailData = emailResponse.data;
                if (emailData.data && emailData.data.email) {
                    email = emailData.data.email;
                }
            }
            catch (emailError) {
                console.warn('Could not retrieve Twitter email:', emailError);
                // Continue without email
            }
            // Create user DTO
            const user = {
                twitterId: userData.data.id,
                username: userData.data.username,
                displayName: userData.data.name,
                email: email,
                profilePicture: userData.data.profile_image_url
            };
            return user;
        }
        catch (error) {
            console.error('Error getting user info from Twitter:', error);
            if (error.isAxiosError && error.response) {
                console.error('Twitter API error details:', error.response.data);
                throw new error_handler_1.AppError(`Twitter API error: ${error.response.data?.error || 'Unknown error'}`, error.response.status || http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            throw new error_handler_1.AppError('Failed to get user info from Twitter', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Generate an access token
    generateAccessToken(twitterId, username) {
        return jsonwebtoken_1.default.sign({ id: twitterId, username, provider: 'twitter' }, JWT_SECRET, { expiresIn: '15m' });
    }
    // Generate a refresh token
    generateRefreshToken(twitterId, username) {
        return jsonwebtoken_1.default.sign({ id: twitterId, username, provider: 'twitter' }, JWT_SECRET, { expiresIn: '7d' });
    }
    // Handle the complete Twitter auth flow
    async handleTwitterCallback(code) {
        try {
            // Step 1: Get tokens from Twitter
            const tokenResponse = await this.getTokensFromCode(code);
            const { access_token, refresh_token, expires_in } = tokenResponse;
            // Step 2: Get user info from Twitter
            const user = await this.getUserInfo(access_token);
            // Step 3: Check if user already exists
            const existingSocialHandle = await twitterAuthRepository_1.default.findBySocialId(user.twitterId);
            let appUser;
            if (existingSocialHandle?.user) {
                // Existing user - update tokens and profile info
                appUser = await twitterAuthRepository_1.default.updateUserWeb(existingSocialHandle.user.userId, {
                    twitterAccessToken: access_token,
                    twitterRefreshToken: refresh_token
                });
                await twitterAuthRepository_1.default.updateUserSocialHandle(existingSocialHandle.id, {
                    username: user.username,
                    displayName: user.displayName,
                    email: user.email,
                    profilePicture: user.profilePicture
                });
            }
            else {
                // New user - create user and social handle
                appUser = await twitterAuthRepository_1.default.createUserWeb({
                    web3UserName: `${user.username}_${new Date()}`,
                    twitterAccessToken: access_token,
                    twitterRefreshToken: refresh_token,
                    isActiveUser: true
                });
                await twitterAuthRepository_1.default.createUserSocialHandle({
                    userId: appUser.userId,
                    provider: 'twitter',
                    socialId: user.twitterId,
                    username: user.username,
                    displayName: user.displayName,
                    email: user.email,
                    profilePicture: user.profilePicture
                });
            }
            // Step 4: Generate App Tokens
            const jwtAccessToken = this.generateAccessToken(user.twitterId, user.username);
            const jwtRefreshToken = this.generateRefreshToken(user.twitterId, user.username);
            return {
                user,
                accessToken: jwtAccessToken,
                refreshToken: jwtRefreshToken,
                twitterTokens: {
                    access_token,
                    refresh_token,
                    expires_in
                }
            };
        }
        catch (error) {
            console.error('Twitter callback error:', error);
            throw new error_handler_1.AppError('Failed to handle Twitter callback', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // For testing purposes only - no Twitter API access
    async testMockAuth(mockData) {
        try {
            const { twitterId, username, displayName, email, profilePicture } = mockData;
            // Create user object
            const user = {
                twitterId,
                username,
                displayName,
                email,
                profilePicture
            };
            // Generate JWT tokens
            const accessToken = this.generateAccessToken(twitterId, username);
            const refreshToken = this.generateRefreshToken(twitterId, username);
            return { user, accessToken, refreshToken };
        }
        catch (error) {
            console.error('Error in mock authentication:', error);
            throw new error_handler_1.AppError('Mock authentication failed', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    // Refresh an expired access token
    async refreshAccessToken(refreshToken) {
        try {
            const auth = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
            const response = await axios_1.default.post(this.tokenURL, new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`
                }
            });
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in
            };
        }
        catch (error) {
            console.error('Error refreshing access token:', error);
            if (error.isAxiosError && error.response) {
                throw new error_handler_1.AppError(`Failed to refresh access token: ${error.response.data?.error || 'Unknown error'}`, error.response.status || http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            throw new error_handler_1.AppError('Failed to refresh access token', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = new TwitterAuthService();
//# sourceMappingURL=twitterAuthService.js.map