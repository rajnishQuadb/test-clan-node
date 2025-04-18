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
      provider,
      socialId,
      tokens
      // web3Username removed from here
    } = req.body;
    
    // No longer requiring web3Username
    if (!email || !username || !provider || !socialId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if user already exists by social identity
    let user = await User.findOne({ 'socialHandles.socialId': socialId, 'socialHandles.provider': provider });
    
    if (!user) {
      user = await User.findOne({ 'socialHandles.email': email });
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
          username,
          email,
          displayName: displayName || username,
          profilePicture,
          tokens: provider === 'twitter' ? tokens : undefined,
          connectedAt: new Date(),
          isPrimary: user.socialHandles.length === 0
        });
      } else {
        // Update the existing social handle with new information
        existingSocialHandle.username = username;
        existingSocialHandle.email = email;
        existingSocialHandle.displayName = displayName || username;
        existingSocialHandle.profilePicture = profilePicture;
        
        if (provider === 'twitter' && tokens) {
          existingSocialHandle.tokens = tokens;
        }
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
    } else {
      // Create new user with this social handle
    
      
      user = await User.create({
        web3Username: "", // Temporary value that will be updated later
        socialHandles: [{
          provider,
          socialId,
          username,
          email,
          displayName: displayName || username,
          profilePicture,
          tokens: provider === 'twitter' ? tokens : undefined,
          connectedAt: new Date(),
          isPrimary: true
        }]
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Get primary social account info
    const primarySocial = user.socialHandles.find(h => h.isPrimary) || user.socialHandles[0];
    
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        web3Username: user.web3Username === "" ? null : user.web3Username,
        username: primarySocial?.username,
        email: primarySocial?.email,
        displayName: primarySocial?.displayName,
        profilePicture: primarySocial?.profilePicture,
        hasKiltConnection: user.isKiltConnected,
        needsWeb3Setup: user.web3Username === "" , // Flag to indicate web3 setup is needed
        socialHandles: user.socialHandles.map(handle => ({
          provider: handle.provider,
          displayName: handle.displayName
        }))
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
      .populate('campaigns', 'title description startDate endDate');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get primary social account
    const primarySocial = user.socialHandles.find(h => h.isPrimary) || user.socialHandles[0] || {};
    
    // Check if the user has a temporary web3Username
    const needsWeb3Setup = user.web3Username.startsWith('temp_');

    // Format the response to match the profile section requirements
    const profileData = {
      basics: {
        _id: user._id,
        web3Username: needsWeb3Setup ? null : user.web3Username,
        username: primarySocial.username,
        email: primarySocial.email,
        displayName: primarySocial.displayName,
        profilePicture: primarySocial.profilePicture,
        isActive: user.isActive,
        needsWeb3Setup: needsWeb3Setup
      },
      kiltConnection: {
        did: user.did,
        wallet: user.wallet,
        connectionDate: user.kiltConnectionDate,
        isConnected: user.isKiltConnected
      },
      socialHandles: user.socialHandles.map(handle => ({
        provider: handle.provider,
        displayName: handle.displayName,
        profilePicture: handle.profilePicture,
        connectedAt: handle.connectedAt,
        isPrimary: handle.isPrimary
      })),
      joinedCampaigns: user.campaigns,
      rewards: user.rewards
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
// @desc    Update KILT connection information
// @route   PUT /api/users/kilt-connection
// @access  Private
export const updateKiltConnection = async (req, res) => {
  try {
    const { web3Username, did, wallet } = req.body;
    
    // Now requiring web3Username along with did
    if (!web3Username || !did) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide web3Username and DID' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if the requested web3Username is already taken by another user
    if (user.web3Username !== web3Username) {
      const existingUser = await User.findOne({
        web3Username,
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'This web3Username is already taken'
        });
      }
    }
    
    // Update KILT and web3Username fields
    user.web3Username = web3Username;
    user.did = did;
    user.wallet = wallet || user.wallet;
    user.kiltConnectionDate = new Date();
    user.isKiltConnected = true;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      kiltConnection: {
        web3Username: user.web3Username,
        did: user.did,
        wallet: user.wallet,
        kiltConnectionDate: user.kiltConnectionDate,
        isKiltConnected: user.isKiltConnected
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Link another social account to existing user
// @route   POST /api/users/link-social
// @access  Private
export const linkSocialAccount = async (req, res) => {
  try {
    const { provider, socialId, displayName, email, username, profilePicture, tokens } = req.body;
    
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
      username,
      email,
      displayName,
      profilePicture,
      tokens: provider === 'twitter' ? tokens : undefined,
      connectedAt: new Date(),
      isPrimary: false
    });
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Social account linked successfully',
      socialHandles: user.socialHandles.map(handle => ({
        provider: handle.provider,
        displayName: handle.displayName,
        isPrimary: handle.isPrimary
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Set primary social account
// @route   PUT /api/users/primary-social
// @access  Private
export const setPrimarySocialAccount = async (req, res) => {
  try {
    const { provider, socialId } = req.body;
    
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
    
    // Check if the social account exists
    const socialIndex = user.socialHandles.findIndex(
      handle => handle.provider === provider && handle.socialId === socialId
    );
    
    if (socialIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Social account not found'
      });
    }
    
    // Reset all isPrimary flags
    user.socialHandles.forEach(handle => {
      handle.isPrimary = false;
    });
    
    // Set the new primary social account
    user.socialHandles[socialIndex].isPrimary = true;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Primary social account updated',
      socialHandles: user.socialHandles.map(handle => ({
        provider: handle.provider,
        displayName: handle.displayName,
        isPrimary: handle.isPrimary
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};