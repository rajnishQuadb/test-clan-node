import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';
import Campaign from './Campaign';
import User from './User';

// Define types for CampaignParticipant
interface CampaignParticipantAttributes {
  campaignParticipantId: string;
  campaignId: string;
  userId: string;
  joinedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampaignParticipantCreationAttributes extends Optional<CampaignParticipantAttributes, 'campaignParticipantId'> {}

export class CampaignParticipant extends Model<CampaignParticipantAttributes, CampaignParticipantCreationAttributes> 
  implements CampaignParticipantAttributes {
  
  public campaignParticipantId!: string;
  public campaignId!: string;
  public userId!: string;
  public joinedAt!: Date;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize CampaignParticipant model
CampaignParticipant.init(
  {
    campaignParticipantId: {
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
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'Campaign_Participants',
    timestamps: true,
    indexes: [
      { fields: ['campaignId'] },
      { fields: ['userId'] },
      { unique: true, fields: ['campaignId', 'userId'] },
      { fields: ['joinedAt'] }
    ]
  }
);

export default CampaignParticipant;