import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

interface ClanAttributes {
  id: string;
  title: string;
  // other attributes can be added later
}

export class Clan extends Model<ClanAttributes> implements ClanAttributes {
  public id!: string;
  public title!: string;
  // Add other attributes later
}

Clan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'clans',
    timestamps: true
  }
);

export default Clan;