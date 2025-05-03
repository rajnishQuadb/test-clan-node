// import { v4 as uuidv4 } from 'uuid';
// // import TwitterUser from '../models/TwitterUser';
// import UserSocialHandle from '../models/UserSocialHandle';
// import User from '../models/User';
// import { TwitterUserDTO } from '../types/twitterAuth';

// class TwitterAuthRepository {
//   // async findByTwitterId(twitterId: string): Promise<TwitterUserDTO | null> {
//   //   try {
//   //     const user = await TwitterUser.findOne({ where: { twitterId } });
//   //     if (!user) return null;
      
//   //     return this.mapToDTO(user);
//   //   } catch (error) {
//   //     console.error('Error in findByTwitterId:', error);
//   //     throw error;
//   //   }
//   // }
  
//   // async findByUsername(username: string): Promise<TwitterUserDTO | null> {
//   //   try {
//   //     const user = await TwitterUser.findOne({ where: { username } });
//   //     if (!user) return null;
      
//   //     return this.mapToDTO(user);
//   //   } catch (error) {
//   //     console.error('Error in findByUsername:', error);
//   //     throw error;
//   //   }
//   // }
  
//   // async createUser(userData: TwitterUserDTO): Promise<TwitterUserDTO> {
//   //   try {
//   //     const user = await TwitterUser.create({
//   //       id: uuidv4(),
//   //       twitterId: userData.twitterId,
//   //       username: userData.username,
//   //       displayName: userData.displayName,
//   //       email: userData.email,
//   //       profilePicture: userData.profilePicture
//   //     });
      
//   //     return this.mapToDTO(user);
//   //   } catch (error) {
//   //     console.error('Error in createUser:', error);
//   //     throw error;
//   //   }
//   // }
  
//   // async updateUser(id: string, userData: Partial<TwitterUserDTO>): Promise<TwitterUserDTO | null> {
//   //   try {
//   //     const user = await TwitterUser.findByPk(id);
//   //     if (!user) return null;
      
//   //     await user.update(userData);
//   //     return this.mapToDTO(user);
//   //   } catch (error) {
//   //     console.error('Error in updateUser:', error);
//   //     throw error;
//   //   }
//   // }
//   // New function to find social handle by socialId (Twitter ID)
//   async findBySocialId(socialId: string): Promise<UserSocialHandle | null> {
//     try {
//       const socialHandle = await UserSocialHandle.findOne({
//         where: { socialId },
//         include: [{ model: User}]
//       });
//       return socialHandle;
//     } catch (error) {
//       console.error('Error in findBySocialId:', error);
//       throw error;
//     }
//   }
//   // Function to create a new user based on social login details (Twitter in this case)
//   async createUserWeb(userData: {
//     web3UserName: string;
//     DiD?: string;
//     twitterAccessToken?: string;
//     twitterRefreshToken?: string;
//     isEarlyUser?: boolean;
//     isActiveUser?: boolean;
//     activeClanId?: string;
//     clanJoinDate?: Date;
//   }): Promise<any> {
//     try {
//       // Create a new user based on the passed data
//       const user = await User.create({
//         userId: uuidv4(), // Automatically generate userId
//         web3UserName: userData.web3UserName,  // Using correct field 'web3UserName'
//         DiD: userData.DiD, // Optional field, if provided
//         twitterAccessToken: userData.twitterAccessToken,
//         twitterRefreshToken: userData.twitterRefreshToken,
//         isEarlyUser: userData.isEarlyUser || false,
//         isActiveUser: userData.isActiveUser || true,
//         activeClanId: userData.activeClanId,
//         clanJoinDate: userData.clanJoinDate
//       });
  
//       return user; // Return the created user object directly
//     } catch (error) {
//       console.error('Error in createUserWeb:', error);
//       throw error;
//     }
//   }
  

// // Function to update an existing user by ID
// async updateUserWeb(id: string, userData: {
//   web3UserName?: string;
//   DiD?: string;
//   twitterAccessToken?: string;
//   twitterRefreshToken?: string;
//   isEarlyUser?: boolean;
//   isActiveUser?: boolean;
//   activeClanId?: string;
//   clanJoinDate?: Date;
// }): Promise<any | null> {
//   try {
//     // Find user by primary key (userId)
//     const user = await User.findByPk(id);
//     if (!user) return null;

//     // Update the user with new data, using 'userData' passed to the function
//     await user.update(userData);

//     return user; // Return the updated user object
//   } catch (error) {
//     console.error('Error in updateUserWeb:', error);
//     throw error;
//   }
// }

//     // New function to create a new user social handle
//     async createUserSocialHandle(data: {
//       userId: string;
//       provider: string;
//       socialId: string;
//       username?: string;
//       email?: string;
//       displayName?: string;
//       profilePicture?: string;
//     }): Promise<UserSocialHandle> {
//       try {
//         // Create new social handle record
//         const socialHandle = await UserSocialHandle.create({
//           userId: data.userId,          // User ID from the request data
//           provider: data.provider,       // Social provider (e.g., "twitter")
//           socialId: data.socialId,       // Social account ID (e.g., Twitter ID)
//           username: data.username,       // Username associated with the social account
//           email: data.email,             // Optional email from the social account
//           displayName: data.displayName, // Optional display name from the social account
//           profilePicture: data.profilePicture // Optional profile picture URL
//         });
    
//         // Return the created social handle object
//         return socialHandle;
//       } catch (error) {
//         console.error('Error in createUserSocialHandle:', error);
//         throw error; // Re-throw the error for the caller to handle
//       }
//     }
    
  
//     // New function to update an existing user social handle
//     async updateUserSocialHandle(id: string, data: Partial<UserSocialHandle>): Promise<UserSocialHandle | null> {
//       try {
//         const socialHandle = await UserSocialHandle.findByPk(id);
//         if (!socialHandle) return null;
  
//         await socialHandle.update(data);
//         return socialHandle;
//       } catch (error) {
//         console.error('Error in updateUserSocialHandle:', error);
//         throw error;
//       }
//     }
//   // private mapToDTO(user: TwitterUser): TwitterUserDTO {
//   //   return {
//   //     twitterId: user.twitterId,
//   //     username: user.username,
//   //     displayName: user.displayName,
//   //     email: user.email,
//   //     profilePicture: user.profilePicture
//   //   };
//   // }
// }

// export default new TwitterAuthRepository();


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