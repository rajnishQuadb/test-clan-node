import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

// Define social handle type for the JSONB array
export type SocialHandleType = {
  provider: 'google' | 'discord' | 'twitter' | 'apple';
  socialId: string;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
//  tokens?: object;
  connectedAt: Date;
  isPrimary: boolean;
};

// Define types for User
interface UserAttributes {
  id: string;
  web3Username: string;
  did?: string;
  wallet?: string;
  kiltConnectionDate?: Date;
  isKiltConnected: boolean;
  socialHandles?: SocialHandleType[];
  isActive: boolean;
  lastLogin: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> 
  implements UserAttributes {
  public id!: string;
  public web3Username!: string;
  public did?: string;
  public wallet?: string;
  public kiltConnectionDate?: Date;
  public isKiltConnected!: boolean;
  public socialHandles?: SocialHandleType[];
  public isActive!: boolean;
  public lastLogin!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    web3Username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    did: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wallet: {
      type: DataTypes.STRING,
      allowNull: true
    },
    kiltConnectionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isKiltConnected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    socialHandles: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['web3Username']
      }
    ]
  }
);

export default User;