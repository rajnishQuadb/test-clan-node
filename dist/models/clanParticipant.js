"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClanParticipant = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ClanParticipant extends sequelize_1.Model {
}
exports.ClanParticipant = ClanParticipant;
ClanParticipant.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    clanId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Clans',
            key: 'clanId',
        },
        onDelete: 'CASCADE',
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'userId',
        },
        onDelete: 'CASCADE',
    },
}, {
    sequelize: db_1.default,
    tableName: 'Clan_Participants',
    timestamps: true,
    indexes: [
        {
            fields: ['clanId'],
        },
        {
            fields: ['userId'],
        },
        {
            unique: true,
            fields: ['clanId', 'userId'], // <- Unique constraint here
        },
    ],
});
exports.default = ClanParticipant;
//# sourceMappingURL=clanParticipant.js.map