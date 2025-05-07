"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleVerify = exports.googleCallback = exports.googleLogin = void 0;
const googleAuthService_1 = __importDefault(require("../services/googleAuthService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const encryption_1 = require("../utils/encryption");
// Redirect to Google OAuth consent screen
const googleLogin = (req, res) => {
    const authUrl = googleAuthService_1.default.getAuthUrl();
    res.redirect(authUrl);
};
exports.googleLogin = googleLogin;
// Handle Google OAuth callback
exports.googleCallback = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const code = req.query.code;
    if (!code) {
        return res.status(http_status_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Authorization code is required'
        });
    }
    const tokens = await googleAuthService_1.default.getTokens(code);
    // Prepare response
    const responseData = {
        success: true,
        tokens
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
// Verify Google ID token and return user data
exports.googleVerify = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    const idToken = authorizationHeader && authorizationHeader.startsWith('Bearer')
        ? authorizationHeader.split(' ')[1]
        : authorizationHeader;
    if (!idToken) {
        return res.status(http_status_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'ID token is required'
        });
    }
    const { user, accessToken, refreshToken } = await googleAuthService_1.default.verifyIdToken(idToken);
    // Prepare response
    const responseData = {
        success: true,
        user: {
            googleId: user.googleId,
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
//# sourceMappingURL=googleAuthController.js.map