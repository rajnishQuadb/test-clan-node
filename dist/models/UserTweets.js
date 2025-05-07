"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTweets = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserTweets extends sequelize_1.Model {
}
exports.UserTweets = UserTweets;
UserTweets.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    tweetId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true, // ensure 1 tweet only stored once
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false, // multiple tweets per user allowed
    },
    isEarlyTweet: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    tableName: "User_Tweets",
    timestamps: true,
    indexes: [
        { fields: ['userId'] }, // for performance on filtering by user
        { fields: ['isEarlyTweet'] },
    ],
});
exports.default = UserTweets;
//# sourceMappingURL=UserTweets.js.map