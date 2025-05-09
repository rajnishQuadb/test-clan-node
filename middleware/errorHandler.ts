import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

/**
 * Global error handling middleware for consistent error responses
 * This middleware should be registered last in your middleware chain
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging (consider a proper logging solution in production)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default values
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let errorCode = 'INTERNAL_ERROR';

  // Handle AppError instances with specific codes and messages
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode || getErrorCodeFromStatus(statusCode);
  } 
  // Handle database errors
  else if (err.name?.includes('Sequelize')) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    
    // Extract meaningful message from database errors
    if (err.message.includes('duplicate') || err.message.includes('unique constraint')) {
      message = 'This record already exists';
      errorCode = 'DUPLICATE_RECORD';
    } else if (err.message.includes('foreign key constraint')) {
      message = 'Referenced record does not exist';
      errorCode = 'INVALID_REFERENCE';
    } else {
      message = 'Database operation failed';
      errorCode = 'DATABASE_ERROR';
    }
  } 
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.message;
    errorCode = 'VALIDATION_ERROR';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
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

/**
 * Get a standardized error code from HTTP status
 */
function getErrorCodeFromStatus(status: number): string {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HTTP_STATUS.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HTTP_STATUS.FORBIDDEN:
      return 'FORBIDDEN';
    case HTTP_STATUS.NOT_FOUND:
      return 'NOT_FOUND';
    case HTTP_STATUS.CONFLICT:
      return 'CONFLICT';
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return 'VALIDATION_ERROR';
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return 'RATE_LIMIT_EXCEEDED';
    default:
      return 'INTERNAL_ERROR';
  }
}

/**
 * Extract useful details from error objects
 */
function getErrorDetails(err: any): object {
  const details: any = {};

  // Extract Sequelize validation errors
  if (err.errors && Array.isArray(err.errors)) {
    details.validationErrors = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  // Include any additional properties that might be useful
  if (err.code) details.code = err.code;
  if (err.name) details.name = err.name;
  if (err.type) details.type = err.type;

  return details;
}

/**
 * Catch-all for unhandled routes (404 handler)
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: HTTP_STATUS.NOT_FOUND,
    errorCode: 'ROUTE_NOT_FOUND'
  });
};