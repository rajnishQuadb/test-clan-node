import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in headers
  if (req.headers.authorization) {
    try {
      // Get token from header (support both with and without Bearer prefix)
      token = req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : req.headers.authorization;
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to ensure inactive users cannot access protected resources
 */
export const active = (req, res, next) => {
  if (req.user && req.user.isActive) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Account is inactive, please contact support'
    });
  }
};