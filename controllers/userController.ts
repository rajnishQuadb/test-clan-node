import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { SocialAuthRequest } from '../types/user';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { encryptData } from '../utils/encryption';

export const socialAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data: SocialAuthRequest = req.body;
  
  const { user, token } = await userService.socialAuth(data);
  
  // Get primary social if exists with proper type definition
  const primarySocial = user.socialHandles?.find(h => h.isPrimary) || user.socialHandles?.[0] || {
    username: undefined,
    email: undefined,
    displayName: undefined,
    profilePicture: undefined
  };
  
  // Prepare response
  const responseData = {
    success: true,
    token,
    user: {           
      _id: user.id,
      web3Username: user.web3Username,
      username: primarySocial.username,
      email: primarySocial.email,
      displayName: primarySocial.displayName,
      profilePicture: primarySocial.profilePicture,
      hasKiltConnection: user.isKiltConnected,
      kilt: {
        did: user.did,
        wallet: user.wallet,
        connectionDate: user.kiltConnectionDate
      },
      socialHandles: user.socialHandles?.map(handle => ({
        provider: handle.provider,
        displayName: handle.displayName
      })) || []
    }
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

// Additional controller methods will go here