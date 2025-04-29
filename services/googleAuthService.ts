import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { GoogleTokenPayload, GoogleUserDTO } from '../types/googleAuth';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

// Initialize OAuth client
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';
const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

class GoogleAuthService {
  // Generate the Google auth URL for redirection
  getAuthUrl(): string {
    return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      prompt: 'consent' // Force prompt to ensure we get a refresh token
    });
  }
  
  // Exchange the authorization code for tokens
  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new AppError('Failed to retrieve access token', HTTP_STATUS.BAD_REQUEST);
    }
  }
  
  // Verify Google ID token and return user data directly
  async verifyIdToken(idToken: string): Promise<{ user: GoogleUserDTO, accessToken: string, refreshToken: string }> {
    try {
      // Verify the token
      const ticket = await oAuth2Client.verifyIdToken({
        idToken,
        audience: CLIENT_ID
      });
      
      const payload = ticket.getPayload() as unknown as GoogleTokenPayload;
      if (!payload) {
        throw new AppError('Invalid token payload', HTTP_STATUS.BAD_REQUEST);
      }
      
      const { sub, email, email_verified, name, picture, given_name, family_name } = payload;
      
      if (!sub || !email || !name) {
        throw new AppError('Missing required user information', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Create user object but don't save it to DB
      const user: GoogleUserDTO = {
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
    } catch (error) {
      console.error('Error verifying token:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof Error && error.message?.includes('Token used too late')) {
        throw new AppError('Token has expired. Please re-authenticate.', HTTP_STATUS.BAD_REQUEST);
      }
      throw new AppError('Invalid token', HTTP_STATUS.BAD_REQUEST);
    }
  }
  
  // Generate an access token
  generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );
  }
  
  // Generate a refresh token
  generateRefreshToken(userId: string, email: string): string {
    return jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
  }
}

export default new GoogleAuthService();