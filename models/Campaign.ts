import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import CampaignLeaderBoard from './CampaignLeaderBoard';

// Define types for Campaign
interface CampaignAttributes {
  campaignId: string;
  leaderBoardId: string | null;
  banner: string;
  title: string;
  description: string;
  organiserLogo: string;
  organiserLink: string;
  rewardPool: number;
  startDate: Date;
  endDate: Date;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampaignCreationAttributes extends Optional<CampaignAttributes, 'campaignId'> {}

export class Campaign extends Model<CampaignAttributes, CampaignCreationAttributes> 
  implements CampaignAttributes {
  
  public campaignId!: string;
  public leaderBoardId!: string | null;
  public banner!: string;
  public title!: string;
  public description!: string;
  public organiserLogo!: string;
  public organiserLink!: string;
  public rewardPool!: number;
  public startDate!: Date;
  public endDate!: Date;
  public status!: boolean;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Campaign model
Campaign.init(
  {
    campaignId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    leaderBoardId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Campaign_LeaderBoards',
        key: 'leaderBoardId'
      }
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    organiserLogo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    organiserLink: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rewardPool: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'Campaigns',
    timestamps: true,
    indexes: [
      { fields: ['leaderBoardId'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] },
      { fields: ['status'] }
    ]
  }
);

export default Campaign;