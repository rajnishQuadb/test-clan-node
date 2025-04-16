import Leaderboard from '../models/Leaderboard.js';
import Campaign from '../models/Campaign.js';
import User from '../models/User.js';

/**
 * @desc    Get leaderboards for all campaigns
 * @route   GET /api/leaderboards
 * @access  Public
 */
export const getAllLeaderboards = async (req, res) => {
  try {
    const leaderboards = await Leaderboard.find()
      .populate('campaignId', 'title description')
      .select('-__v -entries.actions');

    res.status(200).json({
      success: true,
      count: leaderboards.length,
      data: leaderboards
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific leaderboard
 * @route   GET /api/leaderboards/:id
 * @access  Public
 */
export const getLeaderboardById = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.findById(req.params.id)
      .populate('campaignId', 'title description startDate endDate isActive')
      .select('-__v');

    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: 'Leaderboard not found'
      });
    }

    // Sort entries by points
    const sortedEntries = [...leaderboard.entries]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        points: entry.points,
        isCurrentUser: req.user ? entry.userId.toString() === req.user.id : false
      }));

    // Get user's position if authenticated
    let userPosition = null;
    if (req.user) {
      userPosition = sortedEntries.findIndex(entry => entry.isCurrentUser) + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        campaign: leaderboard.campaignId,
        totalParticipants: leaderboard.entries.length,
        userPosition,
        entries: sortedEntries,
        lastUpdated: leaderboard.lastUpdated
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new leaderboard for a campaign
 * @route   POST /api/leaderboards
 * @access  Private/Admin
 */
export const createLeaderboard = async (req, res) => {
  try {
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a campaign ID'
      });
    }

    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if leaderboard already exists for this campaign
    let leaderboard = await Leaderboard.findOne({ campaignId });

    if (leaderboard) {
      return res.status(400).json({
        success: false,
        message: 'Leaderboard already exists for this campaign'
      });
    }

    // Create new leaderboard
    leaderboard = await Leaderboard.create({
      campaignId,
      entries: [],
      lastUpdated: new Date()
    });

    // Update campaign with leaderboard reference
    campaign.leaderboard = leaderboard._id;
    await campaign.save();

    res.status(201).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's positions across all leaderboards
 * @route   GET /api/leaderboards/user/me
 * @access  Private
 */
export const getUserLeaderboardPositions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all leaderboards where the user has entries
    const leaderboards = await Leaderboard.find({
      'entries.userId': userId
    }).populate('campaignId', 'title description');
    
    // Format the response
    const userPositions = await Promise.all(leaderboards.map(async (leaderboard) => {
      // Sort entries by points
      const sortedEntries = [...leaderboard.entries].sort((a, b) => b.points - a.points);
      
      // Find user's position
      const userIndex = sortedEntries.findIndex(entry => entry.userId.toString() === userId);
      const userRank = userIndex === -1 ? null : userIndex + 1;
      
      // Find user's entry
      const userEntry = leaderboard.entries.find(entry => entry.userId.toString() === userId);
      
      return {
        campaign: {
          id: leaderboard.campaignId._id,
          title: leaderboard.campaignId.title
        },
        rank: userRank,
        totalParticipants: leaderboard.entries.length,
        points: userEntry ? userEntry.points : 0,
        lastAction: userEntry && userEntry.actions.length > 0 
          ? userEntry.actions[userEntry.actions.length - 1].timestamp 
          : null
      };
    }));
    
    res.status(200).json({
      success: true,
      count: userPositions.length,
      data: userPositions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};