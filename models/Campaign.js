import mongoose from 'mongoose';
const { Schema } = mongoose;

const clanSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  icon: String,
  memberCount: {
    type: Number,
    default: 0
  }
}, { _id: true });

const campaignSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  reward: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  // Add clans array
  clans: [clanSchema],
  // Store array of participants by username
  participants: [{
    username: {
      type: String,
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the leaderboard
  leaderboard: {
    type: Schema.Types.ObjectId,
    ref: 'Leaderboard'
  }
}, { timestamps: true });

// Create an index for efficient participant lookups
campaignSchema.index({ 'participants.username': 1 });
campaignSchema.index({ 'participants.userId': 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;