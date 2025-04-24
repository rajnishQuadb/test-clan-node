import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { promisify } from 'util';
import appleAuthRepository from '../repositories/appleAuthRepository';
import { AppleTokenPayload, AppleUserDTO } from '../types/appleAuth';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

// Initialize JWKS client for Apple
const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  requestHeaders: {}, // Optional
  timeout: 30000 // Defaults to 30s
});

// Promisify the getSigningKey function
const getSigningKey = promisify((kid: string, callback: any) => {
  client.getSigningKey(kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    if (!signingKey) {
      return callback(new Error('Signing key is undefined'));
    }
    callback(null, signingKey);
  });
});

class AppleAuthService {
  // Verify Apple identity token
  async verifyIdentityToken(identityToken: string, name?: string, picture?: string): Promise<{ user: AppleUserDTO, accessToken: string, refreshToken: string }> {
    try {
      // Extract header to get the kid (Key ID)
      const tokenHeader = this.decodeTokenHeader(identityToken);
      if (!tokenHeader || !tokenHeader.kid) {
        throw new AppError('Invalid token header', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Get the signing key from Apple's JWKS
      const signingKey = await getSigningKey(tokenHeader.kid) as string;
      
      // Verify the token
      const decodedToken = await this.verifyToken(identityToken, signingKey) as AppleTokenPayload;
      
      const { sub, email, email_verified } = decodedToken;
      
      if (!sub || !email) {
        throw new AppError('Missing required user information', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Check if user already exists
      let user = await appleAuthRepository.findByEmail(email);
      
      if (!user) {
        // Create new user
        user = await appleAuthRepository.createUser({
          appleId: sub,
          email,
          name: name || 'Apple User', // Default name if not provided
          picture,
          emailVerified: !!email_verified
        });
      } else {
        // Update existing user details if needed
        const updateData: Partial<AppleUserDTO> = {};
        
        if (name && name !== user.name) {
          updateData.name = name;
        }
        
        if (picture && picture !== user.picture) {
          updateData.picture = picture;
        }
        
        if (!user.appleId) {
          updateData.appleId = sub;
        }
        
        if (Object.keys(updateData).length > 0) {
          user = await appleAuthRepository.updateUser(user.id!, updateData) || user;
        }
      }
      
      // Generate JWT tokens - but don't store them
      const accessToken = this.generateAccessToken(user.id!, user.email);
      const refreshToken = this.generateRefreshToken(user.id!, user.email);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('Error verifying Apple token:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Invalid Apple identity token', HTTP_STATUS.BAD_REQUEST);
    }
  }
  
  // Decode token header without verification
  private decodeTokenHeader(token: string): { kid: string } | null {
    try {
      const [headerEncoded] = token.split('.');
      const headerJSON = Buffer.from(headerEncoded, 'base64').toString('utf8');
      return JSON.parse(headerJSON);
    } catch (error) {
      console.error('Error decoding token header:', error);
      return null;
    }
  }
  
  // Verify token with the signing key
  private verifyToken(token: string, signingKey: string): Promise<object> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, signingKey, {
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) return reject(err);
        if (typeof decoded === 'object' && decoded !== null) {
          resolve(decoded);
        } else {
          reject(new Error('Decoded token is not an object'));
        }
      });
    });
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

export default new AppleAuthService();