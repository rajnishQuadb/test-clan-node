"use strict";
// import { Model, DataTypes, Optional } from "sequelize";
// import sequelize from "../config/db";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// interface UserTweetsAttributes {
//   id?: string;
//   tweetId: string;
//   userId: string;
//   isEarlyTweet: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
// interface UserTweetsCreationAttributes extends Optional<UserTweetsAttributes, "id" | "createdAt" | "updatedAt"> {}
// export class UserTweets extends Model<UserTweetsAttributes, UserTweetsCreationAttributes>
//   implements UserTweetsAttributes {
//   public id!: string;
//   public tweetId!: string;
//   public userId!: string;
//   public isEarlyTweet!: boolean;
//   public readonly createdAt!: Date;
//   public readonly updatedAt!: Date;
// }
// UserTweets.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     tweetId: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true, // ensure 1 tweet only stored once
//     },
//     userId: {
//       type: DataTypes.STRING,
//       allowNull: false, // multiple tweets per user allowed
//     },
//     isEarlyTweet: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//     },
//   },
//   {
//     sequelize,
//     tableName: "User_Tweets",
//     timestamps: true,
//     indexes: [
//       { fields: ['userId'] }, // for performance on filtering by user
//       { fields: ['isEarlyTweet'] },
//     ],
//   }
// );
// export default UserTweets;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class UserTweets extends sequelize_1.Model {
}
UserTweets.init({
    tweetId: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID, // Change from STRING to UUID to match User model
        allowNull: false,
    },
    isEarlyTweet: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'User_Tweets',
    timestamps: true,
});
exports.default = UserTweets;
//# sourceMappingURL=UserTweets.js.map