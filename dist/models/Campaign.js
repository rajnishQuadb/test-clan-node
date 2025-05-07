"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Campaign extends sequelize_1.Model {
}
exports.Campaign = Campaign;
// Initialize Campaign model
Campaign.init({
    campaignId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    leaderBoardId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Campaign_LeaderBoards',
            key: 'leaderBoardId'
        }
    },
    banner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    organiserLogo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    organiserLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    rewardPool: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: db_1.default,
    tableName: 'Campaigns',
    timestamps: true,
    indexes: [
        { fields: ['leaderBoardId'] },
        { fields: ['startDate'] },
        { fields: ['endDate'] },
        { fields: ['status'] }
    ]
});
exports.default = Campaign;
//# sourceMappingURL=Campaign.js.map