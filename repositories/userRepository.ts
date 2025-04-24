import { User, SocialHandleType } from '../models/User';
import { UserDTO, SocialHandleDTO } from '../types/user';
import sequelize from '../config/db';

class UserRepository {
  async findByWeb3Username(web3Username: string): Promise<UserDTO | null> {
    try {
      const user = await User.findOne({ 
        where: { web3Username }
      });
      
      if (!user) {
        return null;
      }
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findByWeb3Username:', error);
      throw error;
    }
  }

  async findBySocialIdentity(provider: string, socialId: string): Promise<UserDTO | null> {
    try {
      // Use raw query or Sequelize's JSONB querying capabilities
      const user = await User.findOne({
        where: sequelize.literal(
          `"socialHandles"::jsonb @> '[{"provider":"${provider}","socialId":"${socialId}"}]'`
        )
      });
      
      if (!user) {
        return null;
      }
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in findBySocialIdentity:', error);
      throw error;
    }
  }

  async createUser(userData: UserDTO): Promise<UserDTO> {
    try {
      // Process social handles, explicitly selecting only the fields we want to store
      // This ensures tokens are not included in the database
      const processedSocialHandles = userData.socialHandles?.map(handle => ({
        provider: handle.provider,
        socialId: handle.socialId,
        username: handle.username,
        email: handle.email,
        displayName: handle.displayName,
        profilePicture: handle.profilePicture,
        connectedAt: handle.connectedAt || new Date(),
        isPrimary: handle.isPrimary || false
        // tokens are intentionally not included here
      })) || [];
  
      // Create user with all data including socialHandles
      const user = await User.create({
        web3Username: userData.web3Username,
        did: userData.did,
        wallet: userData.wallet,
        kiltConnectionDate: userData.kiltConnectionDate,
        isKiltConnected: userData.isKiltConnected || false,
        socialHandles: processedSocialHandles,
        isActive: userData.isActive || true,
        lastLogin: userData.lastLogin || new Date()
      });
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  private mapToDTO(user: User): UserDTO {
    return {
      id: user.id,
      web3Username: user.web3Username,
      did: user.did,
      wallet: user.wallet,
      kiltConnectionDate: user.kiltConnectionDate,
      isKiltConnected: user.isKiltConnected,
      socialHandles: user.socialHandles || [],
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };
  }
}

export default new UserRepository();