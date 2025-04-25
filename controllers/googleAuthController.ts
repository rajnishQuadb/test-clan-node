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
  
  // Get user information using the id_token
  if (!tokens.id_token) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'ID token not received from Google'
    });
  }
  
  // Get user information using googleVerify service
  const { user, accessToken, refreshToken } = await googleAuthService.verifyIdToken(tokens.id_token);
  
  // Prepare simplified response with only success and user
  const userData = {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    }
  };
  
  // Create deep link URL for the mobile app
  const deepLinkData = encodeURIComponent(JSON.stringify(userData));
  const deepLinkUrl = `com.app.clans://auth?data=${deepLinkData}`;
  
  // Render an HTML page with user details and a button to return to the app
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .profile {
            text-align: center;
            margin-bottom: 30px;
          }
          .profile-img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 10px;
            border: 3px solid #4285F4;
          }
          .user-info {
            background: #f7f7f7;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .btn-return {
            display: block;
            background: #4285F4;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
            margin-top: 20px;
            border: none;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
          }
          h1 {
            color: #4285F4;
          }
        </style>
      </head>
      <body>
        <div class="profile">
          <h1>Authentication Successful</h1>
          ${user.picture ? `<img src="${user.picture}" alt="Profile" class="profile-img">` : ''}
          <h2>${user.name}</h2>
        </div>
        
        <div class="user-info">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>User ID:</strong> ${user.id}</p>
        </div>
        
        <a href="${deepLinkUrl}" class="btn-return">Return to App</a>
      </body>
    </html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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