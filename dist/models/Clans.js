"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clan = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Clan extends sequelize_1.Model {
}
exports.Clan = Clan;
// Initialize Clan model
Clan.init({
    clanId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    // leaderBoardId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'Clans_LeaderBoards',
    //     key: 'leaderBoardId',
    //   },
    //   onDelete: 'CASCADE',
    // },
    banner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    clanScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Assuming by default a clan is active when created
    },
}, {
    sequelize: db_1.default,
    tableName: 'Clans',
    timestamps: true,
    indexes: [
        {
            fields: ['title'],
        },
        {
            fields: ['clanScore'],
        },
        {
            fields: ['status'],
        },
    ],
});
exports.default = Clan;
//# sourceMappingURL=Clans.js.map