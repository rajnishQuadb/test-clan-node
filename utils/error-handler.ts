import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http-status';
import { Request, Response, NextFunction } from 'express';
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errorCode?: string;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

export const notFound = new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
export const unauthorized = new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
export const badRequest = new AppError(ERROR_MESSAGES.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);
export const internalServerError = new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
export const forbidden = new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
export const tooManyRequests = new AppError(ERROR_MESSAGES.TOO_MANY_REQUESTS, HTTP_STATUS.TOO_MANY_REQUESTS);
export const conflict = new AppError(ERROR_MESSAGES.CONFLICT, HTTP_STATUS.CONFLICT);
export const validationError = new AppError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.UNPROCESSABLE_ENTITY);
