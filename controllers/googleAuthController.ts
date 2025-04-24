import { Request, Response, NextFunction } from 'express';
import googleAuthService from '../services/googleAuthService';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { GoogleAuthRequest } from '../types/googleAuth';
import { encryptData } from '../utils/encryption';

// Redirect to Google OAuth consent screen
export const googleLogin = (req: Request, res: Response) => {
  const authUrl = googleAuthService.getAuthUrl();
  res.redirect(authUrl);
};

// Handle Google OAuth callback
export const googleCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: 'Authorization code is required' 
    });
  }
  
  const tokens = await googleAuthService.getTokens(code);
  
  // Prepare response
  const responseData = {
    success: true,
    tokens
  };
  
  // Encrypt if needed
  if (process.env.ENCRYPT_RESPONSES === 'true') {
    try {
      const encryptedData = encryptData(responseData);
      return res.status(HTTP_STATUS.OK).json({
        encrypted: true,
        data: encryptedData
      });
    } catch (error) {
      console.error('Encryption error:', error);
      // Fall back to unencrypted response
    }
  }
  
  res.status(HTTP_STATUS.OK).json(responseData);
});

// Verify Google ID token and authenticate user
export const googleVerify = catchAsync(async (req: GoogleAuthRequest, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;
  const idToken = authorizationHeader && authorizationHeader.startsWith('Bearer') 
    ? authorizationHeader.split(' ')[1] 
    : authorizationHeader;
    
  if (!idToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: 'ID token is required' 
    });
  }
  
  const { user, accessToken, refreshToken } = await googleAuthService.verifyIdToken(idToken);
  
  // Prepare response
  const responseData = {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    },
    access_token: accessToken,
    refresh_token: refreshToken
  };
  
  // Encrypt if needed
  if (process.env.ENCRYPT_RESPONSES === 'true') {
    try {
      const encryptedData = encryptData(responseData);
      return res.status(HTTP_STATUS.OK).json({
        encrypted: true,
        data: encryptedData
      });
    } catch (error) {
      console.error('Encryption error:', error);
      // Fall back to unencrypted response
    }
  }
  
  res.status(HTTP_STATUS.OK).json(responseData);
});