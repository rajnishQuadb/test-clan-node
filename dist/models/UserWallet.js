"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWallet = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserWallet extends sequelize_1.Model {
}
exports.UserWallet = UserWallet;
// Initialize UserWallet model
UserWallet.init({
    walletId: {
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
    walletAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    chain: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    walletType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isPrimary: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    addedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: db_1.default,
    tableName: 'User_Wallets', // Matching your format
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { unique: true, fields: ['walletAddress', 'chain'] }
    ]
});
exports.default = UserWallet;
//# sourceMappingURL=UserWallet.js.map