import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export interface TwitterUserAttributes {
  id: string;
  twitterId: string;
  username: string;
  displayName: string;
  email?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TwitterUser extends Model<TwitterUserAttributes> implements TwitterUserAttributes {
  public id!: string;
  public twitterId!: string;
  public username!: string;
  public displayName!: string;
  public email?: string;
  public profilePicture?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TwitterUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    twitterId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'twitter_users',
    timestamps: true
  }
);

export default TwitterUser;