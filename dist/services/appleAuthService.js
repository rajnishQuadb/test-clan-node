"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const util_1 = require("util");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
// Initialize JWKS client for Apple
const client = (0, jwks_rsa_1.default)({
    jwksUri: 'https://appleid.apple.com/auth/keys',
    requestHeaders: {}, // Optional
    timeout: 30000 // Defaults to 30s
});
// Promisify the getSigningKey function
const getSigningKey = (0, util_1.promisify)((kid, callback) => {
    client.getSigningKey(kid, (err, key) => {
        if (err)
            return callback(err);
        const signingKey = key?.getPublicKey();
        if (!signingKey) {
            return callback(new Error('Signing key is undefined'));
        }
        callback(null, signingKey);
    });
});
class AppleAuthService {
    // Verify Apple identity token
    async verifyIdentityToken(identityToken, name, picture) {
        try {
            // Extract header to get the kid (Key ID)
            const tokenHeader = this.decodeTokenHeader(identityToken);
            if (!tokenHeader || !tokenHeader.kid) {
                throw new error_handler_1.AppError('Invalid token header', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Get the signing key from Apple's JWKS
            const signingKey = await getSigningKey(tokenHeader.kid);
            // Verify the token
            const decodedToken = await this.verifyToken(identityToken, signingKey);
            const { sub, email, email_verified } = decodedToken;
            if (!sub || !email) {
                throw new error_handler_1.AppError('Missing required user information', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Create user object but don't save to DB
            const user = {
                appleId: sub,
                email,
                name: name || 'Apple User', // Default name if not provided
                picture,
                emailVerified: !!email_verified
            };
            // Generate JWT tokens
            const accessToken = this.generateAccessToken(sub, email);
            const refreshToken = this.generateRefreshToken(sub, email);
            return { user, accessToken, refreshToken };
        }
        catch (error) {
            console.error('Error verifying Apple token:', error);
            if (error instanceof error_handler_1.AppError) {
                throw error;
            }
            throw new error_handler_1.AppError('Invalid Apple identity token', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    // Decode token header without verification
    decodeTokenHeader(token) {
        try {
            const [headerEncoded] = token.split('.');
            const headerJSON = Buffer.from(headerEncoded, 'base64').toString('utf8');
            return JSON.parse(headerJSON);
        }
        catch (error) {
            console.error('Error decoding token header:', error);
            return null;
        }
    }
    // Verify token with the signing key
    verifyToken(token, signingKey) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, signingKey, {
                algorithms: ['RS256']
            }, (err, decoded) => {
                if (err)
                    return reject(err);
                if (typeof decoded === 'object' && decoded !== null) {
                    resolve(decoded);
                }
                else {
                    reject(new Error('Decoded token is not an object'));
                }
            });
        });
    }
    // Generate an access token
    generateAccessToken(userId, email) {
        return jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '15m' });
    }
    // Generate a refresh token
    generateRefreshToken(userId, email) {
        return jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    }
}
exports.default = new AppleAuthService();
//# sourceMappingURL=appleAuthService.js.map