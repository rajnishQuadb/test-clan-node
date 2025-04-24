import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import twitterAuthRepository from '../repositories/twitterAuthRepository';
import { TwitterProfile, TwitterUserDTO, TwitterTokens } from '../types/twitterAuth';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

// Twitter API credentials
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || '';
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || '';
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/api/auth/twitter/callback';

if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET) {
  console.error('Missing required Twitter API credentials');
}

class TwitterAuthService {
  constructor() {
    this.initializePassport();
  }
  
  // Initialize Twitter strategy
  private initializePassport() {
    passport.use(new TwitterStrategy({
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: TWITTER_CALLBACK_URL,
      includeEmail: true
    }, 
    async (token, tokenSecret, profile, done) => {
      try {
        // Store tokens for later use if needed
        const tokens: TwitterTokens = { token, tokenSecret };
        
        // Pass profile and tokens to the callback
        return done(null, { profile, tokens });
      } catch (error) {
        return done(error as Error);
      }
    }));
    
    // Serialize user for session storage
    passport.serializeUser((user, done) => {
      done(null, user);
    });
    
    // Deserialize user from session
    passport.deserializeUser((obj, done) => {
          done(null, obj as false | TwitterUserDTO | null | undefined);
        });
  }
  
  // Handle user creation or update from Twitter profile
  async handleTwitterCallback(profile: TwitterProfile, tokens: TwitterTokens): Promise<{ user: TwitterUserDTO, accessToken: string, refreshToken: string }> {
    try {
      const { id: twitterId, username, displayName, emails, photos, _json } = profile;
      
      if (!twitterId || !username) {
        throw new AppError('Missing required user information', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Get email if available (Twitter doesn't always provide this)
      const email = emails && emails.length > 0 ? emails[0].value : undefined;
      
      // Get profile picture
      const profilePicture = photos && photos.length > 0 
        ? photos[0].value 
        : (_json && _json.profile_image_url_https) || undefined;
      
      // Check if user exists
      let user = await twitterAuthRepository.findByTwitterId(twitterId);
      
      if (!user) {
        // Create new user
        user = await twitterAuthRepository.createUser({
          twitterId,
          username,
          displayName,
          email,
          profilePicture
        });
      } else {
        // Update user information if needed
        const updates: Partial<TwitterUserDTO> = {};
        
        if (displayName !== user.displayName) {
          updates.displayName = displayName;
        }
        
        if (profilePicture && profilePicture !== user.profilePicture) {
          updates.profilePicture = profilePicture;
        }
        
        if (email && email !== user.email) {
          updates.email = email;
        }
        
        if (Object.keys(updates).length > 0) {
          user = await twitterAuthRepository.updateUser(user.id!, updates) || user;
        }
      }
      
      // Generate JWT tokens
      const accessToken = this.generateAccessToken(user.id!, user.username);
      const refreshToken = this.generateRefreshToken(user.id!, user.username);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('Error handling Twitter callback:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to process Twitter authentication', HTTP_STATUS.BAD_REQUEST);
    }
  }
  
  // For testing purposes only
  async testMockAuth(mockData: {
    twitterId: string;
    username: string;
    displayName: string;
    email?: string;
    profilePicture?: string;
  }): Promise<{ user: TwitterUserDTO, accessToken: string, refreshToken: string }> {
    try {
      const { twitterId, username, displayName, email, profilePicture } = mockData;
      
      // Check if user exists
      let user = await twitterAuthRepository.findByTwitterId(twitterId);
      
      if (!user) {
        // Create new user
        user = await twitterAuthRepository.createUser({
          twitterId,
          username,
          displayName,
          email,
          profilePicture
        });
      }
      
      // Generate JWT tokens
      const accessToken = this.generateAccessToken(user.id!, user.username);
      const refreshToken = this.generateRefreshToken(user.id!, user.username);
      
      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('Error in mock authentication:', error);
      throw new AppError('Mock authentication failed', HTTP_STATUS.BAD_REQUEST);
    }
  }
  
  // Generate an access token
  generateAccessToken(userId: string, username: string): string {
    return jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '15m' }
    );
  }
  
  // Generate a refresh token
  generateRefreshToken(userId: string, username: string): string {
    return jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
  }
}

export default new TwitterAuthService();