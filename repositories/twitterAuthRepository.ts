import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import UserSocialHandle from '../models/UserSocialHandle';

class TwitterAuthV2Repository {
  // Find a user by Twitter ID
  async findBySocialId(socialId: string) {
    try {
      const socialHandle = await UserSocialHandle.findOne({
        where: { 
          provider: 'twitter',
          socialId 
        },
        include: [{ model: User }]
      });
      
      return socialHandle;
    } catch (error) {
      console.error('Error finding user by Twitter ID:', error);
      throw error;
    }
  }
  
  // Create a new user
  async createUser(userData: {
    userId: string;
    web3UserName: string;
    twitterAccessToken: string;
    twitterRefreshToken: string;
    isActiveUser: boolean;
  }) {
    try {
      // Generate a random referral code
      const referralCode = Math.random().toString(36).substring(2, 10);
      
      // Create user with Twitter tokens
      const user = await User.create({
        userId: userData.userId,
        referralCode,
        web3UserName: userData.web3UserName,
        twitterAccessToken: userData.twitterAccessToken,
        twitterRefreshToken: userData.twitterRefreshToken,
        isEarlyUser: false,
        isActiveUser: userData.isActiveUser
      });
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Create a social handle for a user
  async createSocialHandle(data: {
    userId: string;
    provider: string;
    socialId: string;
    username?: string;
    displayName?: string;
    profilePicture?: string;
    email?: string;
  }) {
    try {
      // Create social handle - NO tokens here, they're in the User model
      const socialHandle = await UserSocialHandle.create({
        userId: data.userId,
        provider: data.provider,
        socialId: data.socialId,
        username: data.username,
        displayName: data.displayName,
        profilePicture: data.profilePicture,
        email: data.email
      });
      
      return socialHandle;
    } catch (error) {
      console.error('Error creating social handle:', error);
      throw error;
    }
  }
  
  // Update a user's Twitter tokens
  async updateTokens(userId: string, accessToken: string, refreshToken: string) {
    try {
      // Update only the User record with new tokens
      await User.update(
        {
          twitterAccessToken: accessToken,
          twitterRefreshToken: refreshToken
        },
        {
          where: { userId }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  }
  
  // Find a user by ID
  async findUserById(userId: string) {
    try {
      const user = await User.findOne({
        where: { userId },
        include: [{
          model: UserSocialHandle,
          as: 'socialHandles',
          where: { provider: 'twitter' },
          required: false
        }]
      });
      
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  // Get user tokens from User model
  async getUserTokens(userId: string) {
    try {
      // Find the user to get tokens directly from the User model
      const user = await User.findOne({
        where: { userId },
        attributes: ['twitterAccessToken', 'twitterRefreshToken']
      });
      
      if (!user || !user.twitterAccessToken || !user.twitterRefreshToken) {
        return null;
      }
      
      return {
        accessToken: user.twitterAccessToken,
        accessSecret: user.twitterRefreshToken // Using refreshToken as accessSecret
      };
    } catch (error) {
      console.error('Error getting user tokens:', error);
      throw error;
    }
  }
  
  // Update user social handle profile
  async updateUserSocialHandle(userId: string, data: {
    username?: string;
    displayName?: string;
    profilePicture?: string;
    email?: string;
  }) {
    try {
      const socialHandle = await UserSocialHandle.findOne({
        where: {
          userId,
          provider: 'twitter'
        }
      });
      
      if (!socialHandle) return null;
      
      await socialHandle.update(data);
      return socialHandle;
    } catch (error) {
      console.error('Error updating user social handle:', error);
      throw error;
    }
  }
}

export default new TwitterAuthV2Repository();