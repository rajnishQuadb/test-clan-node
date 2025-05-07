"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.HTTP_STATUS = void 0;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};
exports.ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED: 'Not authorized to access this resource',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Invalid request data',
    VALIDATION_ERROR: 'Validation error'
};
//# sourceMappingURL=http-status.js.map