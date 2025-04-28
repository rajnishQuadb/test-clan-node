import { Request } from 'express';

// Social Handle Data Transfer Object
export interface SocialHandleDTO {
  provider: 'google' | 'discord' | 'twitter' | 'apple';
  socialId: string;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  connectedAt?: Date;
}

// Reward History Data Transfer Object
export interface RewardHistoryDTO {
  campaignId: string;
  reward: any;
  rewardDate: Date;
}

// Complete User Data Transfer Object
export interface UserDTO {
  id?: string;
  web3Username: string;
  did?: string;
  wallet?: string;
  twitterAccessToken?: string;
  twitterRefreshToken?: string;
  isEarlyUser?: boolean;
  isActive?: boolean;
  activeClanId?: string;
  clanJoinDate?: Date;
  joinedCampaigns?: string[];
  rewardHistory?: RewardHistoryDTO[];
  socialHandles?: SocialHandleDTO[];
  lastLogin?: Date;
}

// For social authentication requests
export interface SocialAuthRequest {
  web3Username: string;
  did?: string;
  wallet?: string;
  email?: string;
  username?: string;
  displayName?: string;
  profilePicture?: string;
  provider?: 'google' | 'discord' | 'twitter' | 'apple';
  socialId?: string;
  tokens?: {
    accessToken?: string;  // Changed from string to string | undefined
    refreshToken?: string;
    expiresAt?: Date;
  };
}

// For authenticated requests
export interface AuthRequest extends Request {
  user?: {
    id: string;
    web3Username: string;
  };
}

// JWT payload structure
export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}