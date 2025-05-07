"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignLeaderBoard = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class CampaignLeaderBoard extends sequelize_1.Model {
}
exports.CampaignLeaderBoard = CampaignLeaderBoard;
// Initialize CampaignLeaderBoard model
CampaignLeaderBoard.init({
    leaderBoardId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    campaignId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Campaigns',
            key: 'campaignId'
        },
        onDelete: 'CASCADE'
    }
}, {
    sequelize: db_1.default,
    tableName: 'Campaign_LeaderBoards',
    timestamps: true,
    indexes: [
        { unique: true, fields: ['campaignId'] }
    ]
});
exports.default = CampaignLeaderBoard;
//# sourceMappingURL=CampaignLeaderBoard.js.map