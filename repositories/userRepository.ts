import { User } from '../models/User';
import UserSocialHandle from '../models/UserSocialHandle';
import UserWallet from '../models/UserWallet';
import UserRewardHistory from '../models/UserRewardHistory';
import { UserDTO, UserSocialHandleDTO, UserWalletDTO, UserRewardHistoryDTO } from '../types/user';
import { Referral } from '../models/Referral';

class UserRepository {
  async createUser(userData: UserDTO): Promise<UserDTO> {
    try {
      const user = await User.create({
        web3UserName: userData.web3UserName,
        DiD: userData.DiD,
        twitterAccessToken: userData.twitterAccessToken,
        twitterRefreshToken: userData.twitterRefreshToken,
        isEarlyUser: userData.isEarlyUser || false,
        isActiveUser: userData.isActiveUser || true,
        activeClanId: userData.activeClanId,
        clanJoinDate: userData.clanJoinDate
      });

      // Create social handles if provided
      if (userData.socialHandles && userData.socialHandles.length > 0) {
        for (const handle of userData.socialHandles) {
          await UserSocialHandle.create({
            userId: user.userId,
            provider: handle.provider,
            socialId: handle.socialId,
            username: handle.username,
            email: handle.email,
            displayName: handle.displayName,
            profilePicture: handle.profilePicture
          });
        }
      }

      // Create wallets if provided
      if (userData.wallets && userData.wallets.length > 0) {
        for (const wallet of userData.wallets) {
          await UserWallet.create({
            userId: user.userId,
            walletAddress: wallet.walletAddress,
            chain: wallet.chain,
            walletType: wallet.walletType,
            isPrimary: wallet.isPrimary || false,
            addedAt: new Date(),
            isActive: wallet.isActive || true
          });
        }
      }

      // Create reward history if provided
      if (userData.rewardHistory && userData.rewardHistory.length > 0) {
        for (const reward of userData.rewardHistory) {
          await UserRewardHistory.create({
            userId: user.userId,
            campaignId: reward.campaignId,
            reward: reward.reward,
            rewardDate: reward.rewardDate
          });
        }
      }

      // Return the created user with all associations
      return this.findById(user.userId);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<UserDTO>): Promise<UserDTO> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update user fields
      if (userData.web3UserName) user.web3UserName = userData.web3UserName;
      if (userData.DiD) user.DiD = userData.DiD;
      if (userData.twitterAccessToken) user.twitterAccessToken = userData.twitterAccessToken;
      if (userData.twitterRefreshToken) user.twitterRefreshToken = userData.twitterRefreshToken;
      if (userData.isEarlyUser !== undefined) user.isEarlyUser = userData.isEarlyUser;
      if (userData.isActiveUser !== undefined) user.isActiveUser = userData.isActiveUser;
      if (userData.activeClanId !== undefined) user.activeClanId = userData.activeClanId;
      if (userData.clanJoinDate !== undefined) user.clanJoinDate = userData.clanJoinDate;

      await user.save();

      // Update social handles if provided
      if (userData.socialHandles && userData.socialHandles.length > 0) {
        // Handle updates for social handles (simplified approach: delete and recreate)
        await UserSocialHandle.destroy({ where: { userId } });
        
        for (const handle of userData.socialHandles) {
          await UserSocialHandle.create({
            userId,
            provider: handle.provider,
            socialId: handle.socialId,
            username: handle.username,
            email: handle.email,
            displayName: handle.displayName,
            profilePicture: handle.profilePicture
          });
        }
      }

      // Update wallets if provided
      if (userData.wallets && userData.wallets.length > 0) {
        // Similar approach for wallets: delete and recreate
        await UserWallet.destroy({ where: { userId } });
        
        for (const wallet of userData.wallets) {
          await UserWallet.create({
            userId,
            walletAddress: wallet.walletAddress,
            chain: wallet.chain,
            walletType: wallet.walletType,
            isPrimary: wallet.isPrimary || false,
            addedAt: new Date(),
            isActive: wallet.isActive || true
          });
        }
      }

      // Return the updated user with all associations
      return this.findById(userId);
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async findById(userId: string): Promise<UserDTO> {
    try {
      const user = await User.findByPk(userId, {
        include: [
          { model: UserSocialHandle, as: 'socialHandles' },
          { model: UserWallet, as: 'wallets' },
          { model: UserRewardHistory, as: 'rewardHistory' }
        ]
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.mapToUserDTO(user);
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: UserDTO[], total: number, pages: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { rows, count } = await User.findAndCountAll({
        include: [
          { model: UserSocialHandle, as: 'socialHandles' },
          { model: UserWallet, as: 'wallets' },
          { model: UserRewardHistory, as: 'rewardHistory' }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const users = rows.map(user => this.mapToUserDTO(user));
      
      return {
        users,
        total: count,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findByStatus(isActive: boolean, page: number = 1, limit: number = 10): Promise<{ users: UserDTO[], total: number, pages: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const { rows, count } = await User.findAndCountAll({
        where: { isActiveUser: isActive },
        include: [
          { model: UserSocialHandle, as: 'socialHandles' },
          { model: UserWallet, as: 'wallets' },
          { model: UserRewardHistory, as: 'rewardHistory' }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      const users = rows.map(user => this.mapToUserDTO(user));
      
      return {
        users,
        total: count,
        pages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error in findByStatus:', error);
      throw error;
    }
  }

  private mapToUserDTO(user: User): UserDTO {
    // Map social handles
    const socialHandles: UserSocialHandleDTO[] = user.socialHandles ? 
      user.socialHandles.map(handle => ({
        id: handle.id,
        userId: handle.userId,
        provider: handle.provider,
        socialId: handle.socialId,
        username: handle.username,
        email: handle.email,
        displayName: handle.displayName,
        profilePicture: handle.profilePicture,
        createdAt: handle.createdAt,
        updatedAt: handle.updatedAt
      })) : [];

    // Map wallets
    const wallets: UserWalletDTO[] = user.wallets ?
      user.wallets.map(wallet => ({
        walletId: wallet.walletId,
        userId: wallet.userId,
        walletAddress: wallet.walletAddress,
        chain: wallet.chain,
        walletType: wallet.walletType,
        isPrimary: wallet.isPrimary,
        addedAt: wallet.addedAt,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt
      })) : [];

    // Map reward history
    const rewardHistory: UserRewardHistoryDTO[] = user.rewardHistory ?
      user.rewardHistory.map(reward => ({
        id: reward.id,
        userId: reward.userId,
        campaignId: reward.campaignId,
        reward: reward.reward,
        rewardDate: reward.rewardDate,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt
      })) : [];

    // Return complete DTO
    return {
      userId: user.userId,
      web3UserName: user.web3UserName,
      DiD: user.DiD,
      twitterAccessToken: user.twitterAccessToken,
      twitterRefreshToken: user.twitterRefreshToken,
      isEarlyUser: user.isEarlyUser,
      isActiveUser: user.isActiveUser,
      activeClanId: user.activeClanId,
      clanJoinDate: user.clanJoinDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      socialHandles,
      wallets,
      rewardHistory,
      referralCode: user.referralCode
    };
  }

  async findUserById(userId: string) {
    return await User.findByPk(userId);
  }

  // Save the updated user to the database
  async saveUser(user: any) {
    return await user.save(); // You can customize this to fit your ORM's syntax
  }

  async findUserByReferralCode(referralCode: string) {
    return User.findOne({ where: { referralCode, isActiveUser: true } });
  }
  async createReferral(data: {
    referrerUserId: string;
    referredUserId: string;
    referralCode: string;
    joinedAt: Date;
    rewardGiven: boolean;
    tweetId: string;
  }) {
    return Referral.create(data);
  }
}

export default new UserRepository();