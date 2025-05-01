import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';  // Adjust path if needed

// Attributes for Referral
interface ReferralAttributes {
  referralId: string;          // Primary Key
  referrerUserId: string;      // FK -> Users.userId
  referredUserId: string;      // FK -> Users.userId
  referralCode?: string;       // Optional referral code
  joinedAt?: Date;             // When referred user joined
  rewardGiven?: boolean;       // If reward is given
  tweetId?: string;        
  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes
interface ReferralCreationAttributes extends Optional<ReferralAttributes, 'referralId' | 'referralCode' | 'joinedAt' | 'rewardGiven'> {}

export class Referral extends Model<ReferralAttributes, ReferralCreationAttributes> 
  implements ReferralAttributes {
  public referralId!: string;
  public referrerUserId!: string;
  public referredUserId!: string;
  public referralCode?: string;
  public joinedAt?: Date;
  public rewardGiven?: boolean;
  public tweetId?: string;  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
Referral.init(
  {
    referralId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    referrerUserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    referredUserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    referralCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rewardGiven: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tweetId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'Referrals',
    timestamps: true
  }
);

export default Referral;
