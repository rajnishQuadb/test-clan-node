"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTwitterToken = exports.twitterTestAuth = exports.twitterCallback = exports.twitterLogin = void 0;
const twitterAuthService_1 = __importDefault(require("../services/twitterAuthService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const encryption_1 = require("../utils/encryption");
const error_handler_2 = require("../utils/error-handler");
// Initiate Twitter OAuth flow by generating auth URL
exports.twitterLogin = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { url, state } = twitterAuthService_1.default.generateAuthUrl();
    // Store state in session/cookie for CSRF protection verification
    req.session.twitterState = state;
    res.redirect(url);
    // res.status(HTTP_STATUS.OK).json({ url });
});
// Handle Twitter OAuth callback
exports.twitterCallback = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { code, state } = req.query;
    // Verify state parameter to prevent CSRF attacks
    if (!state || state !== req.session.twitterState) {
        throw new error_handler_2.AppError('Invalid state parameter', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    if (!code || typeof code !== 'string') {
        throw new error_handler_2.AppError('No authorization code provided', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    // Process OAuth callback
    const { user, accessToken, refreshToken, twitterTokens } = await twitterAuthService_1.default.handleTwitterCallback(code);
    // Prepare response
    const responseData = {
        success: true,
        user: {
            twitterId: user.twitterId,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            profilePicture: user.profilePicture,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        twitter_tokens: {
            access_token: twitterTokens.access_token,
            refresh_token: twitterTokens.refresh_token,
            expires_in: twitterTokens.expires_in
        }
    };
    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === 'true') {
        try {
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// For testing only
exports.twitterTestAuth = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(http_status_1.HTTP_STATUS.NOT_FOUND).json({
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
    const { user, accessToken, refreshToken } = await twitterAuthService_1.default.testMockAuth(mockData);
    // Prepare response
    const responseData = {
        success: true,
        user: {
            twitterId: user.twitterId,
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
            const encryptedData = (0, encryption_1.encryptData)(responseData);
            return res.status(http_status_1.HTTP_STATUS.OK).json({
                encrypted: true,
                data: encryptedData
            });
        }
        catch (error) {
            console.error('Encryption error:', error);
            // Fall back to unencrypted response
        }
    }
    res.status(http_status_1.HTTP_STATUS.OK).json(responseData);
});
// Refresh Twitter access token
exports.refreshTwitterToken = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        throw new error_handler_2.AppError('Refresh token is required', http_status_1.HTTP_STATUS.BAD_REQUEST);
    }
    const tokens = await twitterAuthService_1.default.refreshAccessToken(refresh_token);
    res.status(http_status_1.HTTP_STATUS.OK).json({
        success: true,
        ...tokens
    });
});
//# sourceMappingURL=twitterAuthController.js.map