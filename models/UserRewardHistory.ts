import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

// Define types for UserRewardHistory
interface UserRewardHistoryAttributes {
  id: string;
  userId: string;
  campaignId: string;
  reward: number;
  rewardDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserRewardHistoryCreationAttributes extends Optional<UserRewardHistoryAttributes, 'id'> {}

export class UserRewardHistory extends Model<UserRewardHistoryAttributes, UserRewardHistoryCreationAttributes> 
  implements UserRewardHistoryAttributes {
  public id!: string;
  public userId!: string;
  public campaignId!: string;
  public reward!: number;
  public rewardDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Association
  public readonly user?: User;
}

// Initialize UserRewardHistory model
UserRewardHistory.init(
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
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false
      // references to campaigns table would be added when that model exists
    },
    reward: {
      type: DataTypes.DECIMAL(20, 8),  // Appropriate for most cryptocurrency values
      allowNull: false
    },
    rewardDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'User_Reward_History',  // Matching your format
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['campaignId'] },
      { fields: ['rewardDate'] }
    ]
  }
);

export default UserRewardHistory;