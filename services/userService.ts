import userRepository from '../repositories/userRepository';
import { UserDTO } from '../types/user';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import sequelize  from '../config/db';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { UserSocialHandle } from '../models/UserSocialHandle';
import UserTweets from '../models/UserTweets';




class UserService {
    // Add this method to your UserService class
    generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '30d' }
    );
  }
  
  // Change return type here ↓
  async createUser(userData: UserDTO): Promise<{ user: UserDTO, token: string }> {
    try {
      // Validate required fields
      if (!userData.web3UserName) {
        throw new AppError('web3UserName is required', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Check if username is already taken
      try {
        const existingUser = await userRepository.findAll();
        const duplicate = existingUser.users.find(user => 
          user.web3UserName.toLowerCase() === userData.web3UserName.toLowerCase()
        );
        
        if (duplicate) {
          throw new AppError('web3UserName already exists', HTTP_STATUS.CONFLICT);
        }
      } catch (error) {
        if (error instanceof AppError) throw error;
        // If error is not about duplicate, continue
      }
      
      // Set defaults
      userData.isActiveUser = userData.isActiveUser ?? true;
      userData.isEarlyUser = userData.isEarlyUser ?? false;
      
      const user = await userRepository.createUser(userData);
      
      // Generate token here
      const token = this.generateToken(user.userId as string);
      
      return { user, token };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error in createUser service:', error);
      throw new AppError('Failed to create user', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(userId: string, userData: Partial<UserDTO>): Promise<UserDTO> {
    try {
      // Check if user exists
      await this.getUserById(userId);
      
      // If updating web3UserName, check if it's already taken
      if (userData.web3UserName) {
        try {
          const existingUser = await userRepository.findAll();
          const duplicate = existingUser.users.find(user => 
            user.web3UserName.toLowerCase() === userData.web3UserName?.toLowerCase() && 
            user.userId !== userId
          );
          
          if (duplicate) {
            throw new AppError('web3UserName already exists', HTTP_STATUS.CONFLICT);
          }
        } catch (error) {
          if (error instanceof AppError) throw error;
          // If error is not about duplicate, continue
        }
      }
      
      return await userRepository.updateUser(userId, userData);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error in updateUser service:', error);
      throw new AppError('Failed to update user', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById(userId: string): Promise<UserDTO> {
    try {
      return await userRepository.findById(userId);
    } catch (error) {
      console.error('Error in getUserById service:', error);
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: UserDTO[], total: number, pages: number }> {
    try {
      return await userRepository.findAll(page, limit);
    } catch (error) {
      console.error('Error in getAllUsers service:', error);
      throw new AppError('Failed to fetch users', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getFilteredUsers(status: string, page: number = 1, limit: number = 10): Promise<{ users: UserDTO[], total: number, pages: number }> {
    try {
      if (status !== 'active' && status !== 'deleted') {
        throw new AppError('Invalid status filter. Use "active" or "deleted"', HTTP_STATUS.BAD_REQUEST);
      }
      
      const isActive = status === 'active';
      return await userRepository.findByStatus(isActive, page, limit);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error in getFilteredUsers service:', error);
      throw new AppError('Failed to fetch filtered users', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }


  // async updateUserToEarlyUser(userId: string, tweetId: string) {
  //   const user = await userRepository.findUserById(userId);
  
  //   if (!user) {
  //     throw new AppError("User not found", 404);
  //   }
  //   // Update user to early user
  //   user.isEarlyUser = true;
  //   // Try to create tweet record
  //   let tweetRecord;
  //   try {
  //     tweetRecord = await UserTweets.create({
  //       tweetId,
  //       userId,
  //       isEarlyTweet: true,
  //     });
  //     console.log("Tweet Record Created:", tweetRecord);
  //   } catch (error: any) {
  //     console.error("Failed to create tweet record:", error.message);
  //     // Optionally, log full error to a logging service here
  //     throw new AppError("Failed to record tweett User is already an early user", 500);
  //   }
  
  //   // Save the updated user
  //   await userRepository.saveUser(user);
  
  //   return user;
  // }
  


  // In userService.ts



  async updateUserToEarlyUser(userId: string, tweetId?: string) {
  try {
    // Find the user first
    const user = await userRepository.findUserById(userId);
  
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    
    // Check if user is already an early user
    if (user.isEarlyUser) {
      console.log(`User ${userId} is already an early user`);
      
      // Just return the user if they're already an early user
      return user;
    }
    
    // Update user to early user
    user.isEarlyUser = true;
    

    
    try {
      // Save the updated user within the transaction
      await userRepository.saveUser(user);
      
      // Only create tweet record if tweetId is provided
      if (tweetId) {
        // Check if this tweet is already recorded
        const existingTweet = await UserTweets.findOne({
          where: { tweetId },
          include: [{
            model: User,
            as: 'user',
            where: { userId }
          }]
        });
        
        if (existingTweet) {
          console.log(`Tweet ${tweetId} is already recorded`);
        } else {
       
          await UserTweets.create(
            {
              tweetId,
              userId,
              isEarlyTweet: true,
            },
           
          );
          console.log(`Tweet record created for tweet ID: ${tweetId}, user ID: ${userId}`);
        }
      }
      
  
      console.log(`User ${userId} successfully updated to early user`);
      
      return user;
    } catch (error: any) {
    
      
      console.error("Transaction failed:", error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new AppError(
          "This tweet has already been recorded for an early user", 
          HTTP_STATUS.CONFLICT
        );
      }
      
      throw new AppError(
        `Failed to update user to early user: ${error.message}`, 
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  } catch (error) {
    // Catch any errors, including those from the transaction
    if (error instanceof AppError) {
      throw error; // Re-throw AppError instances
    }
    
    console.error("Unexpected error in updateUserToEarlyUser:", error);
    throw new AppError(
      "An unexpected error occurred while updating user to early user", 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}


// Add this method to your UserService class
async findOrCreateUserBySocialId(
  provider: string, 
  socialId: string, 
  userData: {
    socialId: string;
    username: string;
    displayName: string;
    email?: string;
    profilePicture?: string;
    twitterAccessToken?: string;
    twitterRefreshToken?: string;
  }
): Promise<{ userId: string; isNewUser: boolean }> {
  try {
    // Check if a social handle with this provider and ID exists
    const existingSocialHandle = await UserSocialHandle.findOne({
      where: {
        provider,
        socialId
      },
      include: [{
        model: User,
        as: 'user'
      }]
    });

    // If user exists, update the tokens and return the user
    if (existingSocialHandle && existingSocialHandle.user) {
      // Update tokens if they've changed
      if (provider === 'twitter' && userData.twitterAccessToken) {
        await existingSocialHandle.update({
          username: userData.username,
          displayName: userData.displayName,
          profilePicture: userData.profilePicture || existingSocialHandle.profilePicture
        });
        
        // Store encrypted tokens if user service has access to User model
        const user = existingSocialHandle.user;
        if (userData.twitterAccessToken) {
          user.twitterAccessToken = userData.twitterAccessToken;
        }
        if (userData.twitterRefreshToken) {
          user.twitterRefreshToken = userData.twitterRefreshToken;
        }
        await user.save();
      }
      
      return {
        userId: existingSocialHandle.user.userId,
        isNewUser: false
      };
    }

    // User doesn't exist, create a new user and social handle
    // Generate a unique web3 username if one doesn't exist
    const web3UserName = userData.username || `${provider}_${socialId.substring(0, 8)}`;
    
    // Create transaction to ensure both user and social handle are created
    const transaction = await sequelize.transaction();
    
    try {
      // Create new user
      const newUser = await User.create({
        web3UserName,
        DiD: `did:${provider}:${socialId}`,
        isEarlyUser: false,
        isActiveUser: true,
        // Add twitter tokens if twitter provider
        ...(provider === 'twitter' && userData.twitterAccessToken ? {
          twitterAccessToken: userData.twitterAccessToken,
          twitterRefreshToken: userData.twitterRefreshToken
        } : {})
      }, { transaction });

      // Create social handle linked to user
      await UserSocialHandle.create({
        userId: newUser.userId,
        provider,
        socialId: userData.socialId,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        profilePicture: userData.profilePicture
      }, { transaction });

      await transaction.commit();

      return {
        userId: newUser.userId,
        isNewUser: true
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error in findOrCreateUserBySocialId:', error);
    throw new AppError('Failed to find or create user', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
}

export default new UserService();