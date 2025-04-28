import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

// Define types for UserSocialHandle
interface UserSocialHandleAttributes {
  id: string;
  userId: string;
  provider: string;
  socialId: string;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserSocialHandleCreationAttributes extends Optional<UserSocialHandleAttributes, 'id'> {}

export class UserSocialHandle extends Model<UserSocialHandleAttributes, UserSocialHandleCreationAttributes> 
  implements UserSocialHandleAttributes {
  public id!: string;
  public userId!: string;
  public provider!: string;
  public socialId!: string;
  public username?: string;
  public email?: string;
  public displayName?: string;
  public profilePicture?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Association
  public readonly user?: User;
}

// Initialize UserSocialHandle model
UserSocialHandle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',  // Uppercase table name
        key: 'userId'
      },
      onDelete: 'CASCADE'
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    socialId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    displayName: {
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
    tableName: 'User_Social_Handles',  // Matching your format
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { unique: true, fields: ['provider', 'socialId'] }
    ]
  }
);

export default UserSocialHandle;