import { Campaign } from './Campaign';
import { CampaignParticipant } from './CampaignParticipant';
import { CampaignLeaderBoard } from './CampaignLeaderBoard';
import { CampaignLeaderBoardUser } from './CampaignLeaderBoardUser';
import { User } from './User';

// Extend the Campaign model interface to include association properties
declare module './Campaign' {
  interface Campaign {
    participants?: CampaignParticipant[];
    leaderBoard?: CampaignLeaderBoard;
  }
}

// Extend the CampaignParticipant model interface
declare module './CampaignParticipant' {
  interface CampaignParticipant {
    user?: User;
    campaign?: Campaign;
  }
}

// Extend the CampaignLeaderBoard model interface
declare module './CampaignLeaderBoard' {
  interface CampaignLeaderBoard {
    leaderboardUsers?: CampaignLeaderBoardUser[];
    campaign?: Campaign;
    campaignDetails?: Campaign;
  }
}

// Extend the CampaignLeaderBoardUser model interface
declare module './CampaignLeaderBoardUser' {
  interface CampaignLeaderBoardUser {
    user?: User;
    leaderboard?: CampaignLeaderBoard;
  }
}