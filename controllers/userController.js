import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Handle social authentication data from frontend
// @route   POST /api/users/social-auth
// @access  Public
export const socialAuth = async (req, res) => {
  try {
    const { 
      email, 
      username, 
      displayName, 
      profilePicture, 
      provider, // Changed from authType to provider
      socialId,
      tokens // Changed from twitterAuth to tokens
    } = req.body;

    // Validate required fields
    if (!email || !username || !provider || !socialId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user exists by email
    let user = await User.findOne({ email });
    
    // If user doesn't exist, check by socialId in the socialHandles array
    if (!user) {
      user = await User.findOne({ 'socialHandles.socialId': socialId });
    }

    if (user) {
      // User exists - check if this social account is already linked
      const existingSocialHandle = user.socialHandles.find(
        handle => handle.socialId === socialId && handle.provider === provider
      );
      
      if (!existingSocialHandle) {
        // Add this social handle to the user's account
        user.socialHandles.push({
          provider,
          socialId,
          displayName: displayName || username,
          profileUrl: profilePicture,
          tokens: provider === 'twitter' ? tokens : undefined,
          connectedAt: new Date()
        });
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
    } else {
      // Create new user with this social handle
      user = await User.create({
        email,
        username,
        displayName: displayName || username,
        profilePicture,
        socialHandles: [{
          provider,
          socialId,
          displayName: displayName || username,
          profileUrl: profilePicture,
          tokens: provider === 'twitter' ? tokens : undefined,
          connectedAt: new Date()
        }]
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        socialHandles: user.socialHandles.map(handle => ({
          provider: handle.provider,
          displayName: handle.displayName
        })),
        kiltData: user.kiltData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-__v')
      .populate('campaigns', 'title description startDate endDate'); // Changed from joinedCampaigns to campaigns
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Format the response to match the profile section requirements
    const profileData = {
      basics: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        isActive: user.isActive
      },
      kiltConnection: user.kiltData,
      socialHandles: user.socialHandles.map(handle => ({
        provider: handle.provider,
        displayName: handle.displayName,
        profileUrl: handle.profileUrl,
        connectedAt: handle.connectedAt
      })),
      joinedCampaigns: user.campaigns, // Changed from joinedCampaigns to campaigns
      rewards: user.rewards // Changed from earnedRewards to rewards based on your model
    };

    res.status(200).json({
      success: true,
      user: profileData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update KILT DID information
// @route   PUT /api/users/kilt-connection
// @access  Private
export const updateKiltConnection = async (req, res) => {
  try {
    const { did, username, wallet } = req.body;
    
    if (!did || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide DID and username' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.kiltData = {
      did,
      username,
      wallet: wallet || user.kiltData?.wallet,
      connectionDate: Date.now(),
      isConnected: true
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      kiltData: user.kiltData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// New controller method to link another social account
export const linkSocialAccount = async (req, res) => {
  try {
    const { provider, socialId, displayName, profileUrl, tokens } = req.body;
    
    if (!provider || !socialId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide provider and socialId'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if this social account is already linked to another user
    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      'socialHandles.socialId': socialId,
      'socialHandles.provider': provider
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This social account is already linked to another user'
      });
    }
    
    // Check if user already has this social account linked
    const alreadyLinked = user.socialHandles.some(
      handle => handle.provider === provider && handle.socialId === socialId
    );
    
    if (alreadyLinked) {
      return res.status(400).json({
        success: false,
        message: 'This social account is already linked to your account'
      });
    }
    
    // Add new social handle
    user.socialHandles.push({
      provider,
      socialId,
      displayName,
      profileUrl,
      tokens: provider === 'twitter' ? tokens : undefined,
      connectedAt: new Date()
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Social account linked successfully',
      socialHandles: user.socialHandles.map(handle => ({
        provider: handle.provider,
        displayName: handle.displayName
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};