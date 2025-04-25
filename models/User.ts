import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

// Define reward history type for JSONB array
export type RewardHistoryType = {
  campaignId: string;
  reward: any; // Using 'any' for flexibility, could be more specific
  rewardDate: Date;
};

// Define social handle type for JSONB array
export type SocialHandleType = {
  provider: 'google' | 'discord' | 'twitter' | 'apple';
  socialId: string;
  username?: string;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  connectedAt: Date;
};

// Define types for User
interface UserAttributes {
  id: string;                      // UUID Primary Key
  web3Username: string;            // Unique, required
  did?: string;                    // Unique
  wallet?: string;                 // Unique
  twitterAccessToken?: string;     // Encrypted, optional
  twitterRefreshToken?: string;    // Encrypted, optional
  isEarlyUser: boolean;            // Boolean flag
  isActive: boolean;               // Boolean flag, renamed from isActiveUser
  activeClanId?: string;           // FK to Clan
  clanJoinDate?: Date;             // When user joined a clan
  joinedCampaigns?: string[];      // Array of campaign UUIDs
  rewardHistory?: RewardHistoryType[]; // Array of rewards
  socialHandles?: SocialHandleType[];  // Array of social accounts
  lastLogin: Date;                 // Timestamp
  createdAt?: Date;                // Auto by Sequelize
  updatedAt?: Date;                // Auto by Sequelize
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> 
  implements UserAttributes {
  public id!: string;
  public web3Username!: string;
  public did?: string;
  public wallet?: string;
  public twitterAccessToken?: string;
  public twitterRefreshToken?: string;
  public isEarlyUser!: boolean;
  public isActive!: boolean;
  public activeClanId?: string;
  public clanJoinDate?: Date;
  public joinedCampaigns?: string[];
  public rewardHistory?: RewardHistoryType[];
  public socialHandles?: SocialHandleType[];
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
      unique: true,
      allowNull: true
    },
    wallet: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    twitterAccessToken: {
      type: DataTypes.TEXT,  // Encrypted, so needs more space
      allowNull: true
    },
    twitterRefreshToken: {
      type: DataTypes.TEXT,  // Encrypted, so needs more space
      allowNull: true
    },
    isEarlyUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    activeClanId: {
      type: DataTypes.UUID,
      allowNull: true,
      // references: {
      //   model: 'clans',
      //   key: 'id'
      // }
    },
    clanJoinDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joinedCampaigns: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    },
    rewardHistory: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    socialHandles: {
      type: DataTypes.JSONB,
      defaultValue: []
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
      { unique: true, fields: ['web3Username'] },
      { unique: true, fields: ['did'] },
      { unique: true, fields: ['wallet'] },
      { fields: ['activeClanId'] }
    ]
  }
);

export default User;