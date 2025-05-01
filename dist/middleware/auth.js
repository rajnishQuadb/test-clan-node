"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.active = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const protect = async (req, res, next) => {
    let token;
    // Check if token exists in headers
    if (req.headers.authorization) {
        try {
            // Get token from header (support both with and without Bearer prefix)
            token = req.headers.authorization.startsWith('Bearer')
                ? req.headers.authorization.split(' ')[1]
                : req.headers.authorization;
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '');
            // Get user from token
            const user = await User_1.User.findOne({ where: { userId: decoded.id } });
            if (!user) {
                return next(new error_handler_1.AppError('User not found', http_status_1.HTTP_STATUS.UNAUTHORIZED));
            }
            // Attach user to request object (only the parts needed for AuthRequest)
            req.user = {
                userId: user.userId,
                web3UserName: user.web3UserName
            };
            next();
        }
        catch (error) {
            console.error(error);
            return next(new error_handler_1.AppError('Not authorized, token failed', http_status_1.HTTP_STATUS.UNAUTHORIZED));
        }
    }
    else {
        return next(new error_handler_1.AppError('Not authorized, no token', http_status_1.HTTP_STATUS.UNAUTHORIZED));
    }
};
exports.protect = protect;
/**
 * Middleware to ensure inactive users cannot access protected resources
 */
const active = async (req, res, next) => {
    // First get the full user record since AuthRequest only has userId and web3UserName
    const authReq = req;
    if (!authReq.user?.userId) {
        return next(new error_handler_1.AppError('Not authorized', http_status_1.HTTP_STATUS.UNAUTHORIZED));
    }
    const user = await User_1.User.findOne({ where: { userId: authReq.user.userId } });
    if (user && user.isActiveUser) {
        next();
    }
    else {
        return next(new error_handler_1.AppError('Account is inactive, please contact support', http_status_1.HTTP_STATUS.FORBIDDEN));
    }
};
exports.active = active;
//# sourceMappingURL=auth.js.map