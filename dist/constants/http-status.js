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
    INTERNAL_SERVER_ERROR: 500,
    TOO_MANY_REQUESTS: 429,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    PRECONDITION_FAILED: 412,
    UNPROCESSABLE_ENTITY: 422,
    NOT_ACCEPTABLE: 406,
    METHOD_NOT_ALLOWED: 405,
    UNSUPPORTED_MEDIA_TYPE: 415,
    IM_A_TEAPOT: 418,
    EXPECTATION_FAILED: 417,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
};
exports.ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED: 'Not authorized to access this resource',
    NOT_FOUND: 'Resource not found',
    BAD_REQUEST: 'Invalid request data',
    VALIDATION_ERROR: 'Validation error',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
    FORBIDDEN: 'Access to this resource is forbidden',
    CONFLICT: 'Resource conflict',
};
//# sourceMappingURL=http-status.js.map