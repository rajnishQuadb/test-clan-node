"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignParticipant = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class CampaignParticipant extends sequelize_1.Model {
}
exports.CampaignParticipant = CampaignParticipant;
// Initialize CampaignParticipant model
CampaignParticipant.init({
    campaignParticipantId: {
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
    joinedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.default,
    tableName: 'Campaign_Participants',
    timestamps: true,
    indexes: [
        { fields: ['campaignId'] },
        { fields: ['userId'] },
        { unique: true, fields: ['campaignId', 'userId'] },
        { fields: ['joinedAt'] }
    ]
});
exports.default = CampaignParticipant;
//# sourceMappingURL=CampaignParticipant.js.map