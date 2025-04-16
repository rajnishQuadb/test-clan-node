import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Social authentication data as an array of objects to support multiple providers
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
    displayName: String,
    email: String,
    profileUrl: String,
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
    }
  }],
  
  // KILT Protocol data
  kiltData: {
    did: String,
    username: String,
    connectionDate: Date,
    wallet: String, // Added wallet address field
    isConnected: {
      type: Boolean,
      default: false
    }
  },
  
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
    reward: Schema.Types.Mixed, // Using Mixed type to support any reward structure
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