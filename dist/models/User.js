"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
class User extends sequelize_1.Model {
}
exports.User = User;
// Initialize User model
User.init({
    userId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    referralCode: {
        type: sequelize_1.DataTypes.STRING(10), // ✅ Max 10 chars
        unique: true,
        allowNull: false,
        defaultValue: () => generateReferralCode() // ✅ Custom generator
    },
    web3UserName: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    DiD: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    twitterAccessToken: {
        type: sequelize_1.DataTypes.TEXT, // Encrypted, so needs more space
        allowNull: true
    },
    twitterRefreshToken: {
        type: sequelize_1.DataTypes.TEXT, // Encrypted, so needs more space
        allowNull: true
    },
    isEarlyUser: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActiveUser: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    activeClanId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true
        // references will be set up in associations
    },
    clanJoinDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db_1.default,
    tableName: 'Users', // Uppercase table name
    timestamps: true,
    indexes: [
        { unique: true, fields: ['web3UserName'] },
        { unique: true, fields: ['DiD'] },
        { fields: ['activeClanId'] }
    ]
});
exports.default = User;
//# sourceMappingURL=User.js.map