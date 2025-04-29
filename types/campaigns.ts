// Campaign-related DTOs and types

export interface CampaignDTO {
  campaignId?: string;
  leaderBoardId?: string;
  banner: string;
  title: string;
  description: string;
  organiserLogo: string;
  organiserLink: string;
  rewardPool: number;
  startDate: Date;
  endDate: Date;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  participants?: CampaignParticipantDTO[];
}

export interface CampaignParticipantDTO {
  campaignParticipantId?: string;
  campaignId: string;
  userId: string;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    userId: string;
    web3UserName: string;
  };
}

export interface CampaignLeaderBoardDTO {
  leaderBoardId?: string;
  campaignId: string;
  createdAt?: Date;
  updatedAt?: Date;
  users?: CampaignLeaderBoardUserDTO[];
}

export interface CampaignLeaderBoardUserDTO {
  id?: string;
  leaderBoardId: string;
  userId: string;
  userName: string;
  ranking: number;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// For filtering campaigns
export enum CampaignStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  PAST = 'past',
  ALL = 'all'
}

export interface CampaignFilter {
  status?: CampaignStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// For campaign creation
export interface CreateCampaignRequest {
  banner: string;
  title: string;
  description: string;
  organiserLogo: string;
  organiserLink: string;
  rewardPool: number;
  startDate: Date;
  endDate: Date;
}

// For campaign join
export interface JoinCampaignRequest {
  campaignId: string;
  userId: string;
}

// For leaderboard updates
export interface UpdateLeaderboardPointsRequest {
  leaderBoardId: string;
  userId: string;
  points: number;
}