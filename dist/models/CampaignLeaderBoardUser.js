"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignLeaderBoardUser = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class CampaignLeaderBoardUser extends sequelize_1.Model {
}
exports.CampaignLeaderBoardUser = CampaignLeaderBoardUser;
// Initialize CampaignLeaderBoardUser model
CampaignLeaderBoardUser.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    leaderBoardId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Campaign_LeaderBoards',
            key: 'leaderBoardId'
        },
        onDelete: 'CASCADE'
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'userId'
        },
        onDelete: 'CASCADE'
    },
    userName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ranking: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    points: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize: db_1.default,
    tableName: 'Campaign_LeaderBoard_Users',
    timestamps: true,
    indexes: [
        { fields: ['leaderBoardId'] },
        { fields: ['userId'] },
        { unique: true, fields: ['leaderBoardId', 'userId'] },
        { fields: ['ranking'] },
        { fields: ['points'] }
    ]
});
exports.default = CampaignLeaderBoardUser;
//# sourceMappingURL=CampaignLeaderBoardUser.js.map