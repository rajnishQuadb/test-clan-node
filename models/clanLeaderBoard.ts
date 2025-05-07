import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';


interface ClanLeaderBoardAttributes {
  leaderBoardId: string;
  clanId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClanLeaderBoardCreationAttributes extends Optional<ClanLeaderBoardAttributes, 'leaderBoardId'> {}

export class ClanLeaderBoard extends Model<ClanLeaderBoardAttributes, ClanLeaderBoardCreationAttributes>
  implements ClanLeaderBoardAttributes {
  public leaderBoardId!: string;
  public clanId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClanLeaderBoard.init(
  {
    leaderBoardId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    clanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Clans',
        key: 'clanId'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    tableName: 'Clans_LeaderBoards',
    timestamps: true,
    indexes: [
      {
        fields: ['clanId'],
      }
    ],
  }
);

export default ClanLeaderBoard;
