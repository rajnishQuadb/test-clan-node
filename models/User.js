import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  // Web3 username as primary identifier (from KILT)
  web3Username: {
    type: String,
    unique: true,
    required: false,
    trim: true,
    index: true
  },
  
  // KILT Protocol fields moved to top level
  did: String,
  wallet: String,
  kiltConnectionDate: Date,
  isKiltConnected: {
    type: Boolean,
    default: false
  },
  
  // Social authentication data as an array of objects to support multiple providers
  // Now includes all user basic information
  socialHandles: [{
    provider: {
      type: String,
      enum: ['google', 'discord', 'twitter', 'apple'],
      required: true
    },
    socialId: {
      type: String,
      required: true
    },
    username: String,
    email: String,
    displayName: String,
    profilePicture: String,
    // For Twitter-specific data
    tokens: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date
    },
    // When this social account was connected
    connectedAt: {
      type: Date,
      default: Date.now
    },
    // Flag to indicate primary social account
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Campaign and clan participation
  clanMemberships: [{
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    clanId: {
      type: String
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Array of campaigns the user has joined
  campaigns: [{
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  
  // Rewards earned by the user
  rewards: [{
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign'
    },
    reward: Schema.Types.Mixed,
    dateAwarded: {
      type: Date,
      default: Date.now
    },
    claimed: {
      type: Boolean,
      default: false
    }
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;