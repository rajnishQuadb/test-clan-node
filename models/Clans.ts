import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

// Define types for Clan
interface ClanAttributes {
  clanId: string;
  // leaderBoardId: string;
  banner: string;
  title: string;
  description: string;
  clanScore: number;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClanCreationAttributes extends Optional<ClanAttributes, 'clanId'> {}

export class Clan extends Model<ClanAttributes, ClanCreationAttributes> implements ClanAttributes {
  public clanId!: string;
  // public leaderBoardId!: string;
  public banner!: string;
  public title!: string;
  public description!: string;
  public clanScore!: number;
  public status!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Clan model
Clan.init(
  {
    clanId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // leaderBoardId: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'Clans_LeaderBoards',
    //     key: 'leaderBoardId',
    //   },
    //   onDelete: 'CASCADE',
    // },
    banner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clanScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Assuming by default a clan is active when created
    },
  },
  {
    sequelize,
    tableName: 'Clans',
    timestamps: true,
    indexes: [
      {
        fields: ['title'],
      },
      {
        fields: ['clanScore'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Clan;
