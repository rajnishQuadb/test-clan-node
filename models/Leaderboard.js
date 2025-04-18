import mongoose from 'mongoose';
const { Schema } = mongoose;

const leaderboardSchema = new Schema({
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  // Track points for each user
  entries: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      default: 0
    },
    // Optional field to store specific actions that earned points
    actions: [{
      type: {
        type: String,
        enum: ['post', 'comment', 'share', 'like', 'other'],
        required: true
      },
      points: {
        type: Number,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      description: String
    }]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for better query performance
leaderboardSchema.index({ campaignId: 1 });
leaderboardSchema.index({ 'entries.userId': 1 });
leaderboardSchema.index({ 'entries.points': -1 }); // For sorting by points

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;