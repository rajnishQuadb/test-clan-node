import User from './User';
import UserRewardHistory from './UserRewardHistory';
import UserWallet from './UserWallet';
import UserSocialHandle from './UserSocialHandle';

// Set up associations
User.hasMany(UserSocialHandle, {
  foreignKey: 'userId',
  as: 'socialHandles'
});
UserSocialHandle.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(UserWallet, {
  foreignKey: 'userId',
  as: 'wallets'
});
UserWallet.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasMany(UserRewardHistory, {
  foreignKey: 'userId',
  as: 'rewardHistory'
});
UserRewardHistory.belongsTo(User, {
  foreignKey: 'userId'
});

export { User, UserSocialHandle, UserWallet, UserRewardHistory };