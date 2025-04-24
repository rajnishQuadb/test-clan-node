import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export interface AppleUserAttributes {
  id: string;
  appleId: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AppleUser extends Model<AppleUserAttributes> implements AppleUserAttributes {
  public id!: string;
  public appleId!: string;
  public email!: string;
  public name!: string;
  public picture?: string;
  public emailVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AppleUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    appleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: 'apple_users',
    timestamps: true
  }
);

export default AppleUser;