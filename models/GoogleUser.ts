import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

export interface GoogleUserAttributes {
  id: string;
  googleId: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GoogleUser extends Model<GoogleUserAttributes> implements GoogleUserAttributes {
  public id!: string;
  public googleId!: string;
  public email!: string;
  public name!: string;
  public givenName?: string;
  public familyName?: string;
  public picture?: string;
  public emailVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GoogleUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    googleId: {
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
    givenName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    familyName: {
      type: DataTypes.STRING,
      allowNull: true
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
    tableName: 'google_users',
    timestamps: true
  }
);

export default GoogleUser;