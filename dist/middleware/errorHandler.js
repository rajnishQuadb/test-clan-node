"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
/**
 * Global error handling middleware for consistent error responses
 * This middleware should be registered last in your middleware chain
 */
const errorHandler = (err, req, res, next) => {
    // Log error for debugging (consider a proper logging solution in production)
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    // Default values
    let statusCode = http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let errorCode = 'INTERNAL_ERROR';
    // Handle AppError instances with specific codes and messages
    if (err instanceof error_handler_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorCode = err.errorCode || getErrorCodeFromStatus(statusCode);
    }
    // Handle database errors
    else if (err.name?.includes('Sequelize')) {
        statusCode = http_status_1.HTTP_STATUS.BAD_REQUEST;
        // Extract meaningful message from database errors
        if (err.message.includes('duplicate') || err.message.includes('unique constraint')) {
            message = 'This record already exists';
            errorCode = 'DUPLICATE_RECORD';
        }
        else if (err.message.includes('foreign key constraint')) {
            message = 'Referenced record does not exist';
            errorCode = 'INVALID_REFERENCE';
        }
        else {
            message = 'Database operation failed';
            errorCode = 'DATABASE_ERROR';
        }
    }
    // Handle validation errors
    else if (err.name === 'ValidationError') {
        statusCode = http_status_1.HTTP_STATUS.BAD_REQUEST;
        message = err.message;
        errorCode = 'VALIDATION_ERROR';
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = http_status_1.HTTP_STATUS.UNAUTHORIZED;
        message = 'Invalid token';
        errorCode = 'INVALID_TOKEN';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = http_status_1.HTTP_STATUS.UNAUTHORIZED;
        message = 'Token expired';
        errorCode = 'TOKEN_EXPIRED';
    }
    // Keep original message for regular errors in development
    else if (process.env.NODE_ENV === 'development') {
        message = err.message;
    }
    // Construct the response
    const errorResponse = {
        success: false,
        message,
        statusCode,
        errorCode,
        // Include error details in development mode
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: getErrorDetails(err)
        })
    };
    // Send the error response
    return res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Get a standardized error code from HTTP status
 */
function getErrorCodeFromStatus(status) {
    switch (status) {
        case http_status_1.HTTP_STATUS.BAD_REQUEST:
            return 'BAD_REQUEST';
        case http_status_1.HTTP_STATUS.UNAUTHORIZED:
            return 'UNAUTHORIZED';
        case http_status_1.HTTP_STATUS.FORBIDDEN:
            return 'FORBIDDEN';
        case http_status_1.HTTP_STATUS.NOT_FOUND:
            return 'NOT_FOUND';
        case http_status_1.HTTP_STATUS.CONFLICT:
            return 'CONFLICT';
        case http_status_1.HTTP_STATUS.UNPROCESSABLE_ENTITY:
            return 'VALIDATION_ERROR';
        case http_status_1.HTTP_STATUS.TOO_MANY_REQUESTS:
            return 'RATE_LIMIT_EXCEEDED';
        default:
            return 'INTERNAL_ERROR';
    }
}
/**
 * Extract useful details from error objects
 */
function getErrorDetails(err) {
    const details = {};
    // Extract Sequelize validation errors
    if (err.errors && Array.isArray(err.errors)) {
        details.validationErrors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
            value: e.value
        }));
    }
    // Include any additional properties that might be useful
    if (err.code)
        details.code = err.code;
    if (err.name)
        details.name = err.name;
    if (err.type)
        details.type = err.type;
    return details;
}
/**
 * Catch-all for unhandled routes (404 handler)
 */
const notFoundHandler = (req, res) => {
    return res.status(http_status_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        statusCode: http_status_1.HTTP_STATUS.NOT_FOUND,
        errorCode: 'ROUTE_NOT_FOUND'
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map