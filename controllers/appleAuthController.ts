import { Response, NextFunction } from 'express';
import appleAuthService from '../services/appleAuthService';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AppleAuthRequest } from '../types/appleAuth';
import { encryptData } from '../utils/encryption';

// Verify Apple identity token and authenticate user
export const appleVerify = catchAsync(async (req: AppleAuthRequest, res: Response, next: NextFunction) => {
  const { identityToken, name, picture } = req.body;
  
  if (!identityToken) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
      success: false, 
      message: 'Identity token is required' 
    });
  }
  
  const { user, accessToken, refreshToken } = await appleAuthService.verifyIdentityToken(identityToken, name, picture);
  
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