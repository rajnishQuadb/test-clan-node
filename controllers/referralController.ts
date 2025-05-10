// import { Request, Response } from "express";
// import referralService from "../services/referralService";
// import { AppError } from "../utils/error-handler";
// import { HTTP_STATUS } from "../constants/http-status";
// import { AuthRequest } from "../types/user";

// class ReferralController {
//   // ----------   CHANGE TO REQ.BOODY   ----------

//   getReferralStats = async (req: AuthRequest, res: Response) => {
//     try {
//       const userId = req.params.userId;

//       if (!userId) {
//         throw new AppError(
//           "User ID not provided or user not authenticated",
//           HTTP_STATUS.UNAUTHORIZED
//         );
//       }

//       const stats = await referralService.getReferralStats(userId);
//       res.json(stats);
//     } catch (error) {
//       if (error instanceof AppError) {
//         res.status(error.statusCode).json({ message: error.message });
//       } else {
//         console.error("Error getting referral stats:", error);
//         res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
//           message: "Internal server error",
//         });
//       }
//     }
//   };

//   // Use a referral code -- Finally join the referal (Join Waitlist)
//   useReferralCode = async (req: AuthRequest, res: Response) => {
//     try {
//       const {userId, referralCode } = req.body;

//       if (!userId) {
//         throw new AppError("User not authenticated", HTTP_STATUS.UNAUTHORIZED);
//       }

//       if (!referralCode) {
//         throw new AppError(
//           "Referral code is required",
//           HTTP_STATUS.BAD_REQUEST
//         );
//       }

//       const referral = await referralService.createReferral(
//         referralCode,
//         userId
//       );
//       res.json({
//         message: "Referral code applied successfully",
//         referral,
//       });
//     } catch (error) {
//       if (error instanceof AppError) {
//         res.status(error.statusCode).json({ message: error.message });
//       } else {
//         console.error("Error using referral code:", error);
//         res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
//           message: "Internal server error",
//         });
//       }
//     }
//   };
// }

// export default new ReferralController();


import { Request, Response } from "express";
import referralService from "../services/referralService";
import { AppError } from "../utils/error-handler";
import { HTTP_STATUS } from "../constants/http-status";
import { AuthRequest } from "../types/user";

class ReferralController {
  // Get referral statistics
  getReferralStats = async (req: Request, res: Response) => {
    try {
      // Get userId from request params instead of body
      const userId = req.params.userId;

      // Validate userId
      if (!userId) {
        throw new AppError(
          "User ID not provided",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new AppError(
          "Invalid User ID format",
          HTTP_STATUS.BAD_REQUEST
        );
      }

          const stats = await referralService.getReferralStats(userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats
    });
    // Don't return the response
  } catch (error) {
    // ...error handling...
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ 
        success: false,
        message: error.message 
      });
    } else {
      console.error("Error getting referral stats:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve referral statistics"
      });
    }
    // Don't return the response
  }
};
  // Use a referral code -- Finally join the referral (Join Waitlist)
  useReferralCode = async (req: Request, res: Response) => {
    try {
      const { userId, referralCode } = req.body;

      // Validate userId
      if (!userId) {
        throw new AppError(
          "User ID is required", 
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new AppError(
          "Invalid User ID format",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate referral code
      if (!referralCode) {
        throw new AppError(
          "Referral code is required",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate referral code format (alphanumeric, reasonable length)
      if (typeof referralCode !== 'string' || referralCode.length < 4 || referralCode.length > 20) {
        throw new AppError(
          "Invalid referral code format",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Process the referral
      const referral = await referralService.createReferral(
        referralCode,
        userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Referral code applied successfully",
        data: {
          referralId: referral.referralId,
          referrerUserId: referral.referrerUserId,
          joinedAt: referral.joinedAt
        }
      });
    } catch (error) {
      // Handle specific error cases
      if (error instanceof AppError) {
        // Different handling for different types of errors
        if (error.message.includes('Invalid referral code')) {
          return res.status(error.statusCode).json({ 
            success: false,
            message: "The referral code you entered is invalid"
          });
        } else if (error.message.includes('own referral code')) {
          return res.status(error.statusCode).json({ 
            success: false,
            message: "You cannot use your own referral code"
          });
        } else if (error.message.includes('already has a referrer')) {
          return res.status(error.statusCode).json({ 
            success: false,
            message: "You have already used a referral code"
          });
        } else {
          return res.status(error.statusCode).json({ 
            success: false,
            message: error.message
          });
        }
      } else {
        console.error("Error using referral code:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Failed to process referral code. Please try again later."
        });
      }
    }
  };
}

export default new ReferralController();