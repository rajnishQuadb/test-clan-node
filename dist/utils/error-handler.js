"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = exports.conflict = exports.tooManyRequests = exports.forbidden = exports.internalServerError = exports.badRequest = exports.unauthorized = exports.notFound = exports.catchAsync = exports.AppError = void 0;
const http_status_1 = require("../constants/http-status");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errorCode = message;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
exports.notFound = new AppError(http_status_1.ERROR_MESSAGES.NOT_FOUND, http_status_1.HTTP_STATUS.NOT_FOUND);
exports.unauthorized = new AppError(http_status_1.ERROR_MESSAGES.UNAUTHORIZED, http_status_1.HTTP_STATUS.UNAUTHORIZED);
exports.badRequest = new AppError(http_status_1.ERROR_MESSAGES.BAD_REQUEST, http_status_1.HTTP_STATUS.BAD_REQUEST);
exports.internalServerError = new AppError(http_status_1.ERROR_MESSAGES.INTERNAL_SERVER_ERROR, http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
exports.forbidden = new AppError(http_status_1.ERROR_MESSAGES.FORBIDDEN, http_status_1.HTTP_STATUS.FORBIDDEN);
exports.tooManyRequests = new AppError(http_status_1.ERROR_MESSAGES.TOO_MANY_REQUESTS, http_status_1.HTTP_STATUS.TOO_MANY_REQUESTS);
exports.conflict = new AppError(http_status_1.ERROR_MESSAGES.CONFLICT, http_status_1.HTTP_STATUS.CONFLICT);
exports.validationError = new AppError(http_status_1.ERROR_MESSAGES.VALIDATION_ERROR, http_status_1.HTTP_STATUS.UNPROCESSABLE_ENTITY);
//# sourceMappingURL=error-handler.js.map