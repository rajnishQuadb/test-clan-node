import { Request, Response, NextFunction } from 'express';
import TwitterPostService from '../services/twitterPostService';

export const Post_Tweet_Controller = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, referralCode } = req.body;

  try {
    // Call service to post tweet and update referral logic
    const result = await TwitterPostService.postTweetAndHandleReferral(userId, referralCode);

    res.status(200).json({
      success: true,
      message: 'Tweet posted and referral processed successfully',
      data: result,
    });
  } catch (error: unknown) {
    // TypeScript now knows 'error' is 'unknown', so we need to assert its type
    if (error instanceof Error) {
      // Error is now treated as a regular JavaScript error
      res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    } else {
      // If it's not an instance of Error, handle it as an unknown error
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
};
