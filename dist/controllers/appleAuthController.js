"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appleVerify = void 0;
const appleAuthService_1 = __importDefault(require("../services/appleAuthService"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const encryption_1 = require("../utils/encryption");
// Verify Apple identity token and return user data
exports.appleVerify = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { identityToken, name, picture } = req.body;
    if (!identityToken) {
        return res.status(http_status_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Identity token is required'
        });
    }
    const { user, accessToken, refreshToken } = await appleAuthService_1.default.verifyIdentityToken(identityToken, name, picture);
    // Prepare response
    const responseData = {
        success: true,
        user: {
            appleId: user.appleId,
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
//# sourceMappingURL=appleAuthController.js.map