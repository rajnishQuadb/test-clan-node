"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
// Initialize OAuth client
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';
const oAuth2Client = new google_auth_library_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
class GoogleAuthService {
    // Generate the Google auth URL for redirection
    getAuthUrl() {
        return oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['profile', 'email'],
            prompt: 'consent' // Force prompt to ensure we get a refresh token
        });
    }
    // Exchange the authorization code for tokens
    async getTokens(code) {
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            return tokens;
        }
        catch (error) {
            console.error('Error getting tokens:', error);
            throw new error_handler_1.AppError('Failed to retrieve access token', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    // Verify Google ID token and return user data directly
    async verifyIdToken(idToken) {
        try {
            // Verify the token
            const ticket = await oAuth2Client.verifyIdToken({
                idToken,
                audience: CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new error_handler_1.AppError('Invalid token payload', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { sub, email, email_verified, name, picture, given_name, family_name } = payload;
            if (!sub || !email || !name) {
                throw new error_handler_1.AppError('Missing required user information', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Create user object but don't save it to DB
            const user = {
                googleId: sub,
                email,
                name,
                givenName: given_name,
                familyName: family_name,
                picture,
                emailVerified: !!email_verified
            };
            // Generate JWT tokens
            const accessToken = this.generateAccessToken(sub, email);
            const refreshToken = this.generateRefreshToken(sub, email);
            return { user, accessToken, refreshToken };
        }
        catch (error) {
            console.error('Error verifying token:', error);
            if (error instanceof error_handler_1.AppError) {
                throw error;
            }
            if (error instanceof Error && error.message?.includes('Token used too late')) {
                throw new error_handler_1.AppError('Token has expired. Please re-authenticate.', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            throw new error_handler_1.AppError('Invalid token', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    // Generate an access token
    generateAccessToken(userId, email) {
        return jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '15m' });
    }
    // Generate a refresh token
    generateRefreshToken(userId, email) {
        return jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    }
}
exports.default = new GoogleAuthService();
//# sourceMappingURL=googleAuthService.js.map