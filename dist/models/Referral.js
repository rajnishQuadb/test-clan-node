"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Referral = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db")); // Adjust path if needed
class Referral extends sequelize_1.Model {
}
exports.Referral = Referral;
// Initialize the model
Referral.init({
    referralId: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    referrerUserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    referredUserId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false
    },
    referralCode: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    joinedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    rewardGiven: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    sequelize: db_1.default,
    tableName: 'Referrals',
    timestamps: true
});
exports.default = Referral;
//# sourceMappingURL=Referral.js.map