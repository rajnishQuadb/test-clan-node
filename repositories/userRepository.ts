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
      // Process social handles to match the model
      const processedSocialHandles = userData.socialHandles?.map(handle => ({
        provider: handle.provider,
        socialId: handle.socialId,
        username: handle.username,
        email: handle.email,
        displayName: handle.displayName,
        profilePicture: handle.profilePicture,
        connectedAt: handle.connectedAt || new Date()
        // Note: tokens are not stored in the DB model
      })) || [];
  
      // Create user with all data including socialHandles
      const user = await User.create({
        web3Username: userData.web3Username,
        did: userData.did,
        wallet: userData.wallet,
        twitterAccessToken: userData.twitterAccessToken,
        twitterRefreshToken: userData.twitterRefreshToken,
        isEarlyUser: userData.isEarlyUser || false,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        activeClanId: userData.activeClanId,
        clanJoinDate: userData.clanJoinDate,
        joinedCampaigns: userData.joinedCampaigns || [],
        rewardHistory: userData.rewardHistory || [],
        socialHandles: processedSocialHandles,
        lastLogin: userData.lastLogin || new Date()
      });
      
      return this.mapToDTO(user);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await User.update(
        { lastLogin: new Date() },
        { where: { id } }
      );
    } catch (error) {
      console.error('Error in updateLastLogin:', error);
      throw error;
    }
  }

  async addSocialHandle(userId: string, socialHandle: SocialHandleDTO): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Process the social handle to match the model
      const processedHandle: SocialHandleType = {
        provider: socialHandle.provider,
        socialId: socialHandle.socialId,
        username: socialHandle.username,
        email: socialHandle.email,
        displayName: socialHandle.displayName,
        profilePicture: socialHandle.profilePicture,
        connectedAt: socialHandle.connectedAt || new Date()
      };
      
      // Add new social handle to existing ones
      const socialHandles = user.socialHandles || [];
      socialHandles.push(processedHandle);
      
      // Update the user
      await user.update({ socialHandles });
    } catch (error) {
      console.error('Error in addSocialHandle:', error);
      throw error;
    }
  }

  private mapToDTO(user: User): UserDTO {
    return {
      id: user.id,
      web3Username: user.web3Username,
      did: user.did,
      wallet: user.wallet,
      twitterAccessToken: user.twitterAccessToken,
      twitterRefreshToken: user.twitterRefreshToken,
      isEarlyUser: user.isEarlyUser,
      isActive: user.isActive,
      activeClanId: user.activeClanId,
      clanJoinDate: user.clanJoinDate,
      joinedCampaigns: user.joinedCampaigns,
      rewardHistory: user.rewardHistory,
      socialHandles: user.socialHandles,
      lastLogin: user.lastLogin
    };
  }
}

export default new UserRepository();