import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

// Define types for UserWallet
interface UserWalletAttributes {
  walletId: string;
  userId: string;
  walletAddress: string;
  chain: string;
  walletType?: string;
  isPrimary: boolean;
  addedAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserWalletCreationAttributes extends Optional<UserWalletAttributes, 'walletId'> {}

export class UserWallet extends Model<UserWalletAttributes, UserWalletCreationAttributes> 
  implements UserWalletAttributes {
  public walletId!: string;
  public userId!: string;
  public walletAddress!: string;
  public chain!: string;
  public walletType?: string;
  public isPrimary!: boolean;
  public addedAt!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Association
  public readonly user?: User;
}

// Initialize UserWallet model
UserWallet.init(
  {
    walletId: {
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
    walletAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    chain: {
      type: DataTypes.STRING,
      allowNull: false
    },
    walletType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'User_Wallets',  // Matching your format
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { unique: true, fields: ['walletAddress', 'chain'] }
    ]
  }
);

export default UserWallet;