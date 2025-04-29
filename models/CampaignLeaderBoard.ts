import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import Campaign from './Campaign';

// Define types for CampaignLeaderBoard
interface CampaignLeaderBoardAttributes {
  leaderBoardId: string;
  campaignId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampaignLeaderBoardCreationAttributes extends Optional<CampaignLeaderBoardAttributes, 'leaderBoardId'> {}

export class CampaignLeaderBoard extends Model<CampaignLeaderBoardAttributes, CampaignLeaderBoardCreationAttributes> 
  implements CampaignLeaderBoardAttributes {
  
  public leaderBoardId!: string;
  public campaignId!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize CampaignLeaderBoard model
CampaignLeaderBoard.init(
  {
    leaderBoardId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    campaignId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Campaigns',
        key: 'campaignId'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    tableName: 'Campaign_LeaderBoards',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['campaignId'] }
    ]
  }
);

export default CampaignLeaderBoard;