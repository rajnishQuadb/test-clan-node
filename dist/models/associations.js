"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupAssociations;
const User_1 = __importDefault(require("./User"));
const UserSocialHandle_1 = __importDefault(require("./UserSocialHandle"));
const UserWallet_1 = __importDefault(require("./UserWallet"));
const UserRewardHistory_1 = __importDefault(require("./UserRewardHistory"));
const Campaign_1 = __importDefault(require("./Campaign"));
const CampaignParticipant_1 = __importDefault(require("./CampaignParticipant"));
const CampaignLeaderBoard_1 = __importDefault(require("./CampaignLeaderBoard"));
const CampaignLeaderBoardUser_1 = __importDefault(require("./CampaignLeaderBoardUser"));
const Referral_1 = __importDefault(require("./Referral")); // Make sure this is imported
const UserTweets_1 = __importDefault(require("./UserTweets")); // Add this import if not present
// Setup all model associations
function setupAssociations() {
    // User related associations
    User_1.default.hasMany(UserSocialHandle_1.default, {
        foreignKey: 'userId',
        as: 'socialHandles',
        onDelete: 'CASCADE'
    });
    UserSocialHandle_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId'
    });
    User_1.default.hasMany(UserWallet_1.default, {
        foreignKey: 'userId',
        as: 'wallets',
        onDelete: 'CASCADE'
    });
    UserWallet_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId'
    });
    User_1.default.hasMany(UserRewardHistory_1.default, {
        foreignKey: 'userId',
        as: 'rewardHistory',
        onDelete: 'CASCADE'
    });
    UserRewardHistory_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId'
    });
    // Add User-Referral associations
    User_1.default.hasMany(Referral_1.default, {
        foreignKey: 'referrerUserId',
        as: 'referralsGiven'
    });
    User_1.default.hasMany(Referral_1.default, {
        foreignKey: 'referredUserId',
        as: 'referralsReceived'
    });
    Referral_1.default.belongsTo(User_1.default, {
        foreignKey: 'referrerUserId',
        as: 'referrer'
    });
    Referral_1.default.belongsTo(User_1.default, {
        foreignKey: 'referredUserId',
        as: 'referred'
    });
    // Add User-UserTweets association
    //  User.hasMany(UserTweets, {
    //   foreignKey: 'userId'
    // });
    // UserTweets.belongsTo(User, {
    //   foreignKey: 'userId'
    // });
    User_1.default.hasMany(UserTweets_1.default, {
        foreignKey: 'userId',
        as: 'tweets', // Adding an alias is a good practice
        onDelete: 'CASCADE' // Optional, but recommended
    });
    UserTweets_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId',
        as: 'user' // Adding an alias is a good practice
    });
    // Campaign & CampaignLeaderBoard - One-to-One
    Campaign_1.default.belongsTo(CampaignLeaderBoard_1.default, {
        foreignKey: 'leaderBoardId',
        as: 'leaderBoard'
    });
    CampaignLeaderBoard_1.default.hasOne(Campaign_1.default, {
        foreignKey: 'leaderBoardId',
        as: 'campaign'
    });
    // CampaignLeaderBoard & Campaign - One-to-One (circular reference)
    CampaignLeaderBoard_1.default.belongsTo(Campaign_1.default, {
        foreignKey: 'campaignId',
        as: 'campaignDetails'
    });
    // Campaign & CampaignParticipant - One-to-Many
    Campaign_1.default.hasMany(CampaignParticipant_1.default, {
        foreignKey: 'campaignId',
        as: 'participants',
        onDelete: 'CASCADE'
    });
    CampaignParticipant_1.default.belongsTo(Campaign_1.default, {
        foreignKey: 'campaignId',
        as: 'campaign'
    });
    // User & CampaignParticipant - One-to-Many
    User_1.default.hasMany(CampaignParticipant_1.default, {
        foreignKey: 'userId',
        as: 'joinedCampaigns',
        onDelete: 'CASCADE'
    });
    CampaignParticipant_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId',
        as: 'user'
    });
    // Campaign & UserRewardHistory - One-to-Many
    Campaign_1.default.hasMany(UserRewardHistory_1.default, {
        foreignKey: 'campaignId',
        as: 'rewards',
        onDelete: 'CASCADE'
    });
    UserRewardHistory_1.default.belongsTo(Campaign_1.default, {
        foreignKey: 'campaignId',
        as: 'campaign'
    });
    // CampaignLeaderBoard & CampaignLeaderBoardUser - One-to-Many
    CampaignLeaderBoard_1.default.hasMany(CampaignLeaderBoardUser_1.default, {
        foreignKey: 'leaderBoardId',
        as: 'leaderboardUsers',
        onDelete: 'CASCADE'
    });
    CampaignLeaderBoardUser_1.default.belongsTo(CampaignLeaderBoard_1.default, {
        foreignKey: 'leaderBoardId',
        as: 'leaderboard'
    });
    // User & CampaignLeaderBoardUser - One-to-Many
    User_1.default.hasMany(CampaignLeaderBoardUser_1.default, {
        foreignKey: 'userId',
        as: 'leaderboardRankings',
        onDelete: 'CASCADE'
    });
    CampaignLeaderBoardUser_1.default.belongsTo(User_1.default, {
        foreignKey: 'userId',
        as: 'user'
    });
}
//# sourceMappingURL=associations.js.map