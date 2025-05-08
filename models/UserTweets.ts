// import { Model, DataTypes, Optional } from "sequelize";
// import sequelize from "../config/db";

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


import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class UserTweets extends Model {
  public tweetId!: string;
  public userId!: string;
  public isEarlyTweet!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserTweets.init(
  {
    tweetId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID, // Change from STRING to UUID to match User model
      allowNull: false,
    },
    isEarlyTweet: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User_Tweets',
    timestamps: true,
  }
);

export default UserTweets;