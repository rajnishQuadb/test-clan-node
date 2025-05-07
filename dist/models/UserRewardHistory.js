"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRewardHistory = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserRewardHistory extends sequelize_1.Model {
}
exports.UserRewardHistory = UserRewardHistory;
// Initialize UserRewardHistory model
UserRewardHistory.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users', // Uppercase table name
            key: 'userId'
        },
        onDelete: 'CASCADE'
    },
    campaignId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Campaigns',
            key: 'campaignId'
        },
        onDelete: 'CASCADE'
    },
    reward: {
        type: sequelize_1.DataTypes.DECIMAL(20, 8), // Appropriate for most cryptocurrency values
        allowNull: false
    },
    rewardDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: db_1.default,
    tableName: 'User_Reward_History', // Matching your format
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['campaignId'] },
        { fields: ['rewardDate'] }
    ]
});
exports.default = UserRewardHistory;
//# sourceMappingURL=UserRewardHistory.js.map