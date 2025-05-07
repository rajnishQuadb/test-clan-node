import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface ClansLeaderBoardUserAttributes {
  id: string;
  leaderBoardId: string;
  userId: string;
  userName: string;
  ranking: number;
  points: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClansLeaderBoardUserCreationAttributes extends Optional<ClansLeaderBoardUserAttributes, 'id'> {}

export class ClansLeaderBoardUser
  extends Model<ClansLeaderBoardUserAttributes, ClansLeaderBoardUserCreationAttributes>
  implements ClansLeaderBoardUserAttributes {
  public id!: string;
  public leaderBoardId!: string;
  public userId!: string;
  public userName!: string;
  public ranking!: number;
  public points!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClansLeaderBoardUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    leaderBoardId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Clans_LeaderBoards',
        key: 'leaderBoardId',
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
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    tableName: 'Clans_LeaderBoard_Users',
    timestamps: true,
    indexes: [
      {
        fields: ['leaderBoardId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['ranking'],
      },
    ],
  }
);

export default ClansLeaderBoardUser;
