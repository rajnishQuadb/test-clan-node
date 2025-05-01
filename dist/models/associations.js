"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRewardHistory = exports.UserWallet = exports.UserSocialHandle = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const UserRewardHistory_1 = __importDefault(require("./UserRewardHistory"));
exports.UserRewardHistory = UserRewardHistory_1.default;
const UserWallet_1 = __importDefault(require("./UserWallet"));
exports.UserWallet = UserWallet_1.default;
const UserSocialHandle_1 = __importDefault(require("./UserSocialHandle"));
exports.UserSocialHandle = UserSocialHandle_1.default;
// Set up associations
User_1.default.hasMany(UserSocialHandle_1.default, {
    foreignKey: 'userId',
    as: 'socialHandles'
});
UserSocialHandle_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId'
});
User_1.default.hasMany(UserWallet_1.default, {
    foreignKey: 'userId',
    as: 'wallets'
});
UserWallet_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId'
});
User_1.default.hasMany(UserRewardHistory_1.default, {
    foreignKey: 'userId',
    as: 'rewardHistory'
});
UserRewardHistory_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId'
});
//# sourceMappingURL=associations.js.map