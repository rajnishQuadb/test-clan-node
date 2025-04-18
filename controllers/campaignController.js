import Campaign from "../models/Campaign.js";
import User from "../models/User.js";
import Leaderboard from "../models/Leaderboard.js";

/**
 * @desc    Create a new campaign
 * @route   POST /api/campaigns
 * @access  Private/Admin
 */
export const createCampaign = async (req, res) => {
  try {
    const { title, description, reward, startDate, endDate, clans } = req.body;

    // Basic validation
    if (!title || !description || !reward || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create campaign
    const campaign = await Campaign.create({
      title,
      description,
      reward,
      startDate,
      endDate,
      clans: clans || [],
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};




/**
 * @desc    Get all campaigns
 * @route   GET /api/campaigns
 * @access  Public
 */
export const getCampaigns = async (req, res) => {
  try {
    // Query parameters
    const { active } = req.query;

    // Filter by active status if specified
    const filter = {};
    if (active === "true") {
      filter.isActive = true;
      filter.endDate = { $gte: new Date() };
    } else if (active === "false") {
      filter.isActive = false;
    }

    const campaigns = await Campaign.find(filter)
      .select("-__v")
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single campaign
 * @route   GET /api/campaigns/:id
 * @access  Public
 */
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).select("-__v");

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error(error);

    // Handle invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Update campaign
 * @route   PUT /api/campaigns/:id
 * @access  Private/Admin
 */
export const updateCampaign = async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Join a clan in a campaign
 * @route   POST /api/campaigns/:id/join
 * @access  Private
 */
// Update in campaignController.js

/**
 * @desc    Join a campaign
 * @route   POST /api/campaigns/:id/join
 * @access  Private
 */
// ...existing code...

/**
 * @desc    Join a campaign
 * @route   POST /api/campaigns/:id/join
 * @access  Private
 */
/**
 * @desc    Join a campaign
 * @route   POST /api/campaigns/:id/join
 * @access  Private
 */
/**
 * @desc    Join a campaign
 * @route   POST /api/campaigns/:id/join
 * @access  Private
 */
export const joinCampaign = async (req, res) => {
  try {
    const { clanId } = req.body;
    
    if (!clanId) {
      return res.status(400).json({
        success: false,
        message: 'Please specify which clan to join'
      });
    }
    
    // Find campaign
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Check if campaign is active
    if (!campaign.isActive || campaign.endDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This campaign is not active'
      });
    }
    
    // Validate that the clan exists in the campaign
    const clanExists = campaign.clans.some(clan => clan._id.toString() === clanId);
    if (!clanExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid clan ID for this campaign'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Check if user already joined this campaign
    const existingMembership = user.clanMemberships.find(
      m => m.campaignId.toString() === req.params.id
    );
    
    if (existingMembership) {
      // Check if 30 days have passed since joining
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (new Date(existingMembership.joinDate) > thirtyDaysAgo) {
        return res.status(400).json({
          success: false,
          message: 'You can only change clans after 30 days of joining'
        });
      }
      
      // Update existing membership
      existingMembership.clanId = clanId;
      existingMembership.joinDate = Date.now();
    } else {
      // Add new membership
      user.clanMemberships.push({
        campaignId: req.params.id,
        clanId: clanId,
        joinDate: Date.now()
      });
      
      // Add campaign to user's campaigns array if not already there
      if (!user.campaigns.includes(req.params.id)) {
        user.campaigns.push(req.params.id);
      }
      
      // Add user to campaign participants
      if (!campaign.participants.some(p => p.userId.toString() === req.user.id)) {
        campaign.participants.push({
          username: user.username,
          userId: user._id,
          joinedAt: new Date()
        });
        
        // Increment participant count
        campaign.totalParticipants += 1;
        
        // Increment clan member count
        const clanIndex = campaign.clans.findIndex(clan => clan._id.toString() === clanId);
        if (clanIndex !== -1) {
          campaign.clans[clanIndex].memberCount += 1;
        }
        
        await campaign.save();
      }
    }
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully joined campaign and clan',
      data: {
        campaign: campaign._id,
        clan: clanId,
        joinDate: new Date()
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
 * @desc    Add points to user in campaign leaderboard
 * @route   POST /api/campaigns/:id/points
 * @access  Private
 */
export const addPoints = async (req, res) => {
  try {
    const { points, actionType, description } = req.body;

    if (!points || !actionType) {
      return res.status(400).json({
        success: false,
        message: "Please provide points and action type",
      });
    }

    // Validate points is a positive number
    if (isNaN(points) || points <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points must be a positive number",
      });
    }

    // Find campaign
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Check if campaign is active
    if (!campaign.isActive || campaign.endDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This campaign is not active",
      });
    }

    // Check if user is a participant
    const isParticipant = campaign.participants.some(
      (p) => p.userId.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: "You must join the campaign before earning points",
      });
    }

    // Update leaderboard
    const leaderboard = await Leaderboard.findById(campaign.leaderboard);

    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: "Leaderboard not found",
      });
    }

    // Find user entry
    const userEntryIndex = leaderboard.entries.findIndex(
      (entry) => entry.userId.toString() === req.user.id
    );

    if (userEntryIndex === -1) {
      // Add new entry if not found
      const user = await User.findById(req.user.id);

      leaderboard.entries.push({
        userId: user._id,
        username: user.username,
        points: points,
        actions: [
          {
            type: actionType,
            points: points,
            description:
              description || `Earned ${points} points for ${actionType}`,
          },
        ],
      });
    } else {
      // Update existing entry
      leaderboard.entries[userEntryIndex].points += points;
      leaderboard.entries[userEntryIndex].actions.push({
        type: actionType,
        points: points,
        description: description || `Earned ${points} points for ${actionType}`,
      });
    }

    leaderboard.lastUpdated = new Date();
    await leaderboard.save();

    // Sort entries by points for response
    const sortedEntries = [...leaderboard.entries].sort(
      (a, b) => b.points - a.points
    );

    // Find user's current rank
    const userRank =
      sortedEntries.findIndex(
        (entry) => entry.userId.toString() === req.user.id
      ) + 1;

    res.status(200).json({
      success: true,
      message: `Successfully added ${points} points`,
      data: {
        totalPoints:
          leaderboard.entries.find((e) => e.userId.toString() === req.user.id)
            ?.points || 0,
        currentRank: userRank,
        totalParticipants: leaderboard.entries.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get campaign leaderboard
 * @route   GET /api/campaigns/:id/leaderboard
 * @access  Public
 */

export const getLeaderboard = async (req, res) => {
  try {
    // Find campaign
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (!campaign.leaderboard) {
      return res.status(404).json({
        success: false,
        message: "Leaderboard not found for this campaign",
      });
    }

    // Get leaderboard with populated user details
    const leaderboard = await Leaderboard.findById(campaign.leaderboard);

    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: "Leaderboard not found",
      });
    }

    // Sort entries by points
    const sortedEntries = [...leaderboard.entries]
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        points: entry.points,
        isCurrentUser: req.user
          ? entry.userId.toString() === req.user.id
          : false,
      }));

    // Get user's position if authenticated
    let userPosition = null;
    if (req.user) {
      userPosition =
        sortedEntries.findIndex((entry) => entry.isCurrentUser) + 1;
    }

    res.status(200).json({
      success: true,
      data: {
        campaignTitle: campaign.title,
        totalParticipants: leaderboard.entries.length,
        userPosition,
        entries: sortedEntries,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
