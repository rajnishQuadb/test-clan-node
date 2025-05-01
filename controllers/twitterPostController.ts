
import { Request, Response, NextFunction } from 'express';
import TwitterPostService from '../services/twitterPostService';  
import axios from 'axios';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../utils/error-handler';


export const PostTweet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Get the tweet text, referral code, and token from the request
    const { text, referralCode, userId, media } = req.body;
  
    // Validate the input parameters
    if (!text || typeof text !== 'string') {
      throw new AppError('Tweet text is required', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      // Post the tweet and handle the referral logic using the service function
      const result = await TwitterPostService.postTweetAndHandleReferral(userId, referralCode, text, media);
  
      // Send success response with the tweet data and referral code
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        tweet: result.tweetResponse,
        referralCode: result.referralCode,
      });
    } catch (error) {
      // Handle errors from the service function
      if (error instanceof AppError) {
        next(error);  // Pass the error to the error handler middleware
      } else {
        console.error('Error posting tweet and processing referral:', error);
        next(new AppError('Internal Server Error', HTTP_STATUS.INTERNAL_SERVER_ERROR));
      }
    }
  });