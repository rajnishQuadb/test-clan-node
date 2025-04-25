import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import twitterAuthService from '../services/twitterAuthService';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { TwitterAuthRequest, TwitterProfile, TwitterTokens } from '../types/twitterAuth';
import { encryptData } from '../utils/encryption';

// Initiate Twitter authentication
export const twitterLogin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('twitter')(req, res, next);
};

// Handle Twitter callback
export const twitterCallback = catchAsync(async (req: TwitterAuthRequest, res: Response, next: NextFunction) => {
  passport.authenticate('twitter', { session: false }, async (err: Error | null, data: any, info: any) => {
    if (err) {
      console.error('Twitter authentication error:', err);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Authentication failed' 
      });
    }
    
    if (!data || !data.profile) {
      console.error('Twitter authentication failed - no user data:', info);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        success: false, 
        message: 'Authentication failed - no user data' 
      });
    }
    
    try {
      const { profile, tokens } = data;
      const { user, accessToken, refreshToken } = await twitterAuthService.handleTwitterCallback(
        profile as TwitterProfile, 
        tokens as TwitterTokens
      );
      
      // Prepare response
      const responseData = {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          profilePicture: user.profilePicture
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        tokens: tokens // Include original Twitter tokens
      };
      
      // Create deep link URL for the mobile app
      const deepLinkData = encodeURIComponent(JSON.stringify(responseData));
      const deepLinkUrl = `com.app.clans://auth?data=${deepLinkData}`;
      
      // Render an HTML page with user details and a button to return to the app
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Twitter Authentication Successful</title>
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
                border: 3px solid #1DA1F2;
              }
              .user-info {
                background: #f7f7f7;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .token-info {
                background: #f0f8ff;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                word-break: break-all;
              }
              .btn-return {
                display: block;
                background: #1DA1F2;
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
                color: #1DA1F2;
              }
              .token-row {
                margin-bottom: 10px;
              }
              .token-label {
                font-weight: bold;
                margin-bottom: 3px;
              }
              .token-value {
                background: #fff;
                padding: 5px;
                border-radius: 4px;
                font-family: monospace;
                overflow-x: auto;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="profile">
              <h1>Twitter Authentication Successful</h1>
              ${user.profilePicture ? `<img src="${user.profilePicture}" alt="Profile" class="profile-img">` : ''}
              <h2>${user.displayName}</h2>
              <p>@${user.username}</p>
            </div>
            
            <div class="user-info">
              <p><strong>User ID:</strong> ${user.id}</p>
              ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
            </div>
            
            <div class="token-info">
              <h3>Tokens</h3>
              <div class="token-row">
                <div class="token-label">Access Token:</div>
                <div class="token-value">${accessToken}</div>
              </div>
              <div class="token-row">
                <div class="token-label">Refresh Token:</div>
                <div class="token-value">${refreshToken}</div>
              </div>
            </div>
            
            <a href="${deepLinkUrl}" class="btn-return">Return to App</a>
          </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// For testing only - test Twitter authentication without real Twitter auth
export const twitterTestAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Endpoint not available in production'
    });
  }
  
  const mockData = {
    twitterId: req.body.twitterId || '123456789',
    username: req.body.username || 'test_twitter_user',
    displayName: req.body.displayName || 'Test Twitter User',
    email: req.body.email,
    profilePicture: req.body.profilePicture || 'https://example.com/default-twitter.png'
  };
  
  const { user, accessToken, refreshToken } = await twitterAuthService.testMockAuth(mockData);
  
  // Prepare response
  const responseData = {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture
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