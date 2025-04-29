import { Model, DataTypes, Optional, HasManyCreateAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelize from '../config/db';
import UserSocialHandle from './UserSocialHandle';
import UserWallet from './UserWallet';
import UserRewardHistory from './UserRewardHistory';

// Define types for User
interface UserAttributes {
  userId: string;                 // UUID Primary Key
  web3UserName: string;           // Unique, required
  DiD?: string;                   // Unique
  twitterAccessToken?: string;    // Encrypted, optional
  twitterRefreshToken?: string;   // Encrypted, optional
  isEarlyUser: boolean;           // Boolean flag
  isActiveUser: boolean;          // Boolean flag
  activeClanId?: string;          // FK to Clan
  clanJoinDate?: Date;            // When user joined a clan
  createdAt?: Date;               // Auto by Sequelize
  updatedAt?: Date;               // Auto by Sequelize
}

interface UserCreationAttributes extends Optional<UserAttributes, 'userId'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> 
  implements UserAttributes {
  public userId!: string;
  public web3UserName!: string;
  public DiD?: string;
  public twitterAccessToken?: string;
  public twitterRefreshToken?: string;
  public isEarlyUser!: boolean;
  public isActiveUser!: boolean;
  public activeClanId?: string;
  public clanJoinDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Association methods
  public createSocialHandle!: HasManyCreateAssociationMixin<UserSocialHandle>;
  public getSocialHandles!: HasManyGetAssociationsMixin<UserSocialHandle>;
  public createWallet!: HasManyCreateAssociationMixin<UserWallet>;
  public getWallets!: HasManyGetAssociationsMixin<UserWallet>;
  public createRewardHistory!: HasManyCreateAssociationMixin<UserRewardHistory>;
  public getRewardHistory!: HasManyGetAssociationsMixin<UserRewardHistory>;
  
  // Associations
  public readonly socialHandles?: UserSocialHandle[];
  public readonly wallets?: UserWallet[];
  public readonly rewardHistory?: UserRewardHistory[];
}

// Initialize User model
User.init(
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    web3UserName: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    DiD: {
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
    isActiveUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    activeClanId: {
      type: DataTypes.UUID,
      allowNull: true,
      // references: {
      //   model: 'Clans',
      //   key: 'id'
      // }
    },
    clanJoinDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'Users',  // Uppercase table name
    timestamps: true,
    indexes: [
      { unique: true, fields: ['web3UserName'] },
      { unique: true, fields: ['DiD'] },
      { fields: ['activeClanId'] }
    ]
  }
);

export default User;