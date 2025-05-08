import User from './User';
import UserSocialHandle from './UserSocialHandle';
import UserWallet from './UserWallet';
import UserRewardHistory from './UserRewardHistory';
import Clans from './Clans';
import clanParticipant from './clanParticipant';
import clanLeaderBoard from './clanLeaderBoard';
import clanLeaderBoardUser from './clanLeaderBoardUser';
import Campaign from './Campaign';
import CampaignParticipant from './CampaignParticipant';
import CampaignLeaderBoard from './CampaignLeaderBoard';
import CampaignLeaderBoardUser from './CampaignLeaderBoardUser';
import Referral from './Referral'; // Make sure this is imported
import UserTweets from './UserTweets'; // Add this import if not present

// Setup all model associations
export default function setupAssociations() {
  
  // User related associations
  User.hasMany(UserSocialHandle, {
    foreignKey: 'userId',
    as: 'socialHandles',
    onDelete: 'CASCADE'
  });
  UserSocialHandle.belongsTo(User, {
    foreignKey: 'userId'
  });

  User.hasMany(UserWallet, {
    foreignKey: 'userId',
    as: 'wallets',
    onDelete: 'CASCADE'
  });
  UserWallet.belongsTo(User, {
    foreignKey: 'userId'
  });

  User.hasMany(UserRewardHistory, {
    foreignKey: 'userId',
    as: 'rewardHistory',
    onDelete: 'CASCADE'
  });
  UserRewardHistory.belongsTo(User, {
    foreignKey: 'userId'
  });

    // Add User-Referral associations
    User.hasMany(Referral, {
      foreignKey: 'referrerUserId',
      as: 'referralsGiven'
    });
    
    User.hasMany(Referral, {
      foreignKey: 'referredUserId',
      as: 'referralsReceived'
    });
    
    Referral.belongsTo(User, {
      foreignKey: 'referrerUserId',
      as: 'referrer'
    });
    
    Referral.belongsTo(User, {
      foreignKey: 'referredUserId',
      as: 'referred'
    });
    
  
  // Remove Clan associations
  
  // Campaign & CampaignLeaderBoard - One-to-One
  Campaign.belongsTo(CampaignLeaderBoard, { 
    foreignKey: 'leaderBoardId', 
    as: 'leaderBoard'
  });
  CampaignLeaderBoard.hasOne(Campaign, { 
    foreignKey: 'leaderBoardId', 
    as: 'campaign'
  });
  
  // CampaignLeaderBoard & Campaign - One-to-One (circular reference)
  CampaignLeaderBoard.belongsTo(Campaign, { 
    foreignKey: 'campaignId', 
    as: 'campaignDetails'
  });
  
  // Campaign & CampaignParticipant - One-to-Many
  Campaign.hasMany(CampaignParticipant, { 
    foreignKey: 'campaignId', 
    as: 'participants',
    onDelete: 'CASCADE'
  });
  CampaignParticipant.belongsTo(Campaign, { 
    foreignKey: 'campaignId', 
    as: 'campaign'
  });
  
  // User & CampaignParticipant - One-to-Many
  User.hasMany(CampaignParticipant, { 
    foreignKey: 'userId', 
    as: 'joinedCampaigns',
    onDelete: 'CASCADE'
  });
  CampaignParticipant.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'user'
  });
  
  // Campaign & UserRewardHistory - One-to-Many
  Campaign.hasMany(UserRewardHistory, {
    foreignKey: 'campaignId',
    as: 'rewards',
    onDelete: 'CASCADE'
  });
  UserRewardHistory.belongsTo(Campaign, {
    foreignKey: 'campaignId',
    as: 'campaign'
  });
  
  // CampaignLeaderBoard & CampaignLeaderBoardUser - One-to-Many
  CampaignLeaderBoard.hasMany(CampaignLeaderBoardUser, { 
    foreignKey: 'leaderBoardId', 
    as: 'leaderboardUsers',
    onDelete: 'CASCADE'
  });
  CampaignLeaderBoardUser.belongsTo(CampaignLeaderBoard, { 
    foreignKey: 'leaderBoardId', 
    as: 'leaderboard'
  });
  
  // User & CampaignLeaderBoardUser - One-to-Many
  User.hasMany(CampaignLeaderBoardUser, { 
    foreignKey: 'userId', 
    as: 'leaderboardRankings',
    onDelete: 'CASCADE'
  });
  CampaignLeaderBoardUser.belongsTo(User, { 
    foreignKey: 'userId', 
    as: 'user'
  });
}