import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status';
import dotenv from 'dotenv';
import { dot } from 'node:test/reporters';

dotenv.config();

// Create a rate limiter for user creation
export const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 user creation requests per windowMs
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use IP and any other identifiers for more accurate limiting
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown';
  },
  // Custom handler to maintain consistent response format
  handler: (req: Request, res: Response) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: 'Too many accounts created from this IP, please try again after an hour',
      retryAfter: Math.ceil(res.getHeader('Retry-After') as number / 60) + ' minutes'
    });
  }
});

// You can create more rate limiters for other endpoints here