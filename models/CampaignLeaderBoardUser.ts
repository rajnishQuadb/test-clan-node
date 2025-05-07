import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import CampaignLeaderBoard from './CampaignLeaderBoard';
import User from './User';

// Define types for CampaignLeaderBoardUser
interface CampaignLeaderBoardUserAttributes {
  id: string;
  leaderBoardId: string;
  userId: string;
  userName: string;
  ranking: number;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampaignLeaderBoardUserCreationAttributes extends Optional<CampaignLeaderBoardUserAttributes, 'id'> {}

export class CampaignLeaderBoardUser extends Model<CampaignLeaderBoardUserAttributes, CampaignLeaderBoardUserCreationAttributes> 
  implements CampaignLeaderBoardUserAttributes {
  
  public id!: string;
  public leaderBoardId!: string;
  public userId!: string;
  public userName!: string;
  public ranking!: number;
  public points!: number;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize CampaignLeaderBoardUser model
CampaignLeaderBoardUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leaderBoardId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Campaign_LeaderBoards',
        key: 'leaderBoardId'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId'
      },
      onDelete: 'CASCADE'
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'Campaign_LeaderBoard_Users',
    timestamps: true,
    indexes: [
      { fields: ['leaderBoardId'] },
      { fields: ['userId'] },
      { unique: true, fields: ['leaderBoardId', 'userId'] },
      { fields: ['ranking'] },
      { fields: ['points'] }
    ]
  }
);

export default CampaignLeaderBoardUser;