"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClanLeaderBoard = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class ClanLeaderBoard extends sequelize_1.Model {
}
exports.ClanLeaderBoard = ClanLeaderBoard;
ClanLeaderBoard.init({
    leaderBoardId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    clanId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Clans',
            key: 'clanId'
        },
        onDelete: 'CASCADE'
    }
}, {
    sequelize: db_1.default,
    tableName: 'Clans_LeaderBoards',
    timestamps: true,
    indexes: [
        {
            fields: ['clanId'],
        }
    ],
});
exports.default = ClanLeaderBoard;
//# sourceMappingURL=clanLeaderBoard.js.map