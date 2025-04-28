import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface ClanParticipantAttributes {
  id: string;
  clanId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClanParticipantCreationAttributes extends Optional<ClanParticipantAttributes, 'id'> {}

export class ClanParticipant
  extends Model<ClanParticipantAttributes, ClanParticipantCreationAttributes>
  implements ClanParticipantAttributes {
  public id!: string;
  public clanId!: string;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClanParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Clans',
        key: 'clanId',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'Clan_Participants',
    timestamps: true,
    indexes: [
      {
        fields: ['clanId'],
      },
      {
        fields: ['userId'],
      },
      {
        unique: true,
        fields: ['clanId', 'userId'], // <- Unique constraint here
      },
    ],
  }
);

export default ClanParticipant;
