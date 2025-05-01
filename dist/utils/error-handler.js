"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalServerError = exports.badRequest = exports.unauthorized = exports.notFound = exports.catchAsync = exports.AppError = void 0;
const http_status_1 = require("../constants/http-status");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
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
//# sourceMappingURL=error-handler.js.map