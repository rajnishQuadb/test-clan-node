import { Request } from 'express';
import 'express';

declare global {
  namespace Express {
    interface User {
      userId: string;
      web3UserName: string;
      id?: string;
      username?: string;
      provider?: string;
    }
  }
}

// User Social Handle DTO
export interface UserSocialHandleDTO {
  id?: string;
  userId?: string;
  provider: string;
  socialId: string;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User Wallet DTO
export interface UserWalletDTO {
  walletId?: string;
  userId?: string;
  walletAddress: string;
  chain: string;
  walletType?: string;
  isPrimary?: boolean;
  addedAt?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// User Reward History DTO
export interface UserRewardHistoryDTO {
  id?: string;
  userId?: string;
  campaignId: string;
  reward: number;
  rewardDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Complete User DTO
export interface UserDTO {
  userId?: string;
  web3UserName: string;
  DiD?: string;
  twitterAccessToken?: string;
  twitterRefreshToken?: string;
  isEarlyUser?: boolean;
  isActiveUser?: boolean;
  activeClanId?: string;
  clanJoinDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Related entities
  socialHandles?: UserSocialHandleDTO[];
  wallets?: UserWalletDTO[];
  rewardHistory?: UserRewardHistoryDTO[];
}

// For social authentication requests
export interface SocialAuthRequest {
  web3UserName: string;
  DiD?: string;
  wallet?: {
    address: string;
    chain: string;
    type?: string;
    isPrimary?: boolean;
  };
  email?: string;
  username?: string;
  displayName?: string;
  profilePicture?: string;
  provider?: string;
  socialId?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}

// For authenticated requests
// export interface AuthRequest extends Request {
//   user?: {
//     userId: string;
//     web3UserName: string;
//   };
//}

export  type AuthRequest = Request

// JWT payload structure
export interface JwtPayload {
  id: string;  // Change from "userId" to "id" to match your token generation
  iat: number;
  exp: number;
}