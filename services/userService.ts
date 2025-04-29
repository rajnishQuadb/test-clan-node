import userRepository from '../repositories/userRepository';
import { UserDTO } from '../types/user';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import jwt from 'jsonwebtoken';

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

  async updateUserToEarlyUser(userId: string, referralCode?: string) {

    const user = await userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user to early user
    user.isEarlyUser = true;

    // Save the updated user
    await userRepository.saveUser(user);
    if (referralCode) {
      const referrer = await userRepository.findUserByReferralCode(referralCode);

      if (!referrer) {
        throw new AppError('Invalid referral code', 400);
      }

      await userRepository.createReferral({
        referrerUserId: referrer.userId,
        referredUserId: user.userId,
        referralCode: referralCode,
        joinedAt: new Date(),
        rewardGiven: false
      });
    }
    return user;
  }
}

export default new UserService();