import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository';
import { UserDTO, SocialAuthRequest, SocialHandleDTO } from '../types/user';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

class UserService {
  async socialAuth(data: SocialAuthRequest): Promise<{ user: UserDTO; token: string }> {
    try {
      const { 
        web3Username, did, wallet, provider, socialId,
        email, username, displayName, profilePicture, tokens 
      } = data;
      
      if (!web3Username) {
        throw new AppError('web3Username is required', HTTP_STATUS.BAD_REQUEST);
      }
      
      // Check if web3Username already exists
      const existingUserWithWeb3 = await userRepository.findByWeb3Username(web3Username);

      let existingUserWithSocial: UserDTO | null = null;
      if (provider && socialId) {
        existingUserWithSocial = await userRepository.findBySocialIdentity(provider, socialId);
        }
       
      // If social account exists with different web3Username, conflict
      if (existingUserWithSocial && existingUserWithSocial.web3Username !== web3Username) {
        throw new AppError(
          'This social account is already linked to a different web3Username',
          HTTP_STATUS.CONFLICT
        );
      }
      
      let user: UserDTO;
      
      if (existingUserWithWeb3) {
        // TODO: Update existing user - for now, just return it
        user = existingUserWithWeb3;
      } else {
        // Create new user
        const newUser: UserDTO = {
          web3Username,
          did,
          wallet,
          kiltConnectionDate: did || wallet ? new Date() : undefined,
          isKiltConnected: Boolean(did || wallet),
          socialHandles: [],
          isActive: true,
          lastLogin: new Date()
        };
        
        // Add social handle if provided
        if (provider && socialId) {
          const socialHandle: SocialHandleDTO = {
            provider,
            socialId,
            username,
            email,
            displayName: displayName || username,
            profilePicture,
           // tokens,
            connectedAt: new Date(),
            isPrimary: true
          };
          
          newUser.socialHandles = [socialHandle];
        }
        
        user = await userRepository.createUser(newUser);
      }
      
      // Generate JWT token
      const token = this.generateToken(user.id as string);
      
      return { user, token };
    } catch (error) {
      console.error('Error in socialAuth service:', error);
      throw error;
    }
  }
  
  generateToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '30d' }
    );
  }
}

export default new UserService();