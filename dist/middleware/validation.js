"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJoinClanRequest = exports.validateUUID = void 0;
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
// Validate UUID format
const validateUUID = (idParam) => {
    return (req, res, next) => {
        const id = req.params[idParam] || req.body[idParam];
        if (!id) {
            return next(new error_handler_1.AppError(`${idParam} is required.`, http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return next(new error_handler_1.AppError(`Invalid ${idParam} format.`, http_status_1.HTTP_STATUS.BAD_REQUEST));
        }
        next();
    };
};
exports.validateUUID = validateUUID;
// Validate clan join request body
const validateJoinClanRequest = (req, res, next) => {
    const { userId, clanId } = req.body;
    if (!userId) {
        return next(new error_handler_1.AppError('User ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
    }
    if (!clanId) {
        return next(new error_handler_1.AppError('Clan ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST));
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        return next(new error_handler_1.AppError('Invalid User ID format.', http_status_1.HTTP_STATUS.BAD_REQUEST));
    }
    if (!uuidRegex.test(clanId)) {
        return next(new error_handler_1.AppError('Invalid Clan ID format.', http_status_1.HTTP_STATUS.BAD_REQUEST));
    }
    next();
};
exports.validateJoinClanRequest = validateJoinClanRequest;
//# sourceMappingURL=validation.js.map