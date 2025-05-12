import { Request, Response, NextFunction } from "express";
import campaignService from "../services/campaignService";
import { catchAsync } from "../utils/error-handler";
import { HTTP_STATUS } from "../constants/http-status";
import {
  CreateCampaignRequest,
  JoinCampaignRequest,
  UpdateLeaderboardPointsRequest,
} from "../types/campaigns";
import { encryptData } from "../utils/encryption";
import { AppError } from "../utils/error-handler";

// Create a new campaign
export const Create_Campaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const campaignData: CreateCampaignRequest = req.body;

    const campaign = await campaignService.createCampaign(campaignData);

    const responseData = {
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    };

    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
      try {
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.CREATED).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.CREATED).json(responseData);
  }
);

// Join a campaign
export const Join_Campaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const joinRequest: JoinCampaignRequest = req.body;

    const result = await campaignService.joinCampaign(joinRequest);

    const responseData = {
      success: true,
      message: result.message,
    };

    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
      try {
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.OK).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  }
);

// Get a single campaign by ID
export const Get_Single_Campaign = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const campaignId = req.params.id;

    const campaign = await campaignService.getCampaignById(campaignId);

    const responseData = {
      success: true,
      data: campaign,
    };

    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
      try {
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.OK).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  }
);

// Get all campaigns with pagination
export const Get_All_Campaigns = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { campaigns, total, pages } = await campaignService.getAllCampaigns(
      page,
      limit
    );

    const responseData = {
      success: true,
      data: campaigns,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    };

    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
      try {
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.OK).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  }
);

// Get filtered campaigns (active/expired/upcoming)
export const Get_Filtered_Campaigns = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const status = req.body.status || "active";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { campaigns, total, pages, filter } =
      await campaignService.getFilteredCampaigns(status, page, limit);

    const responseData = {
      success: true,
      filter,
      data: campaigns,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    };

    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
      try {
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.OK).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  }
);

// Update leaderboard points
export const Update_Leaderboard_Points = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updateRequest: UpdateLeaderboardPointsRequest = req.body;

    const result = await campaignService.updateLeaderboardPoints(updateRequest);

    const responseData = {
      success: true,
      message: result.message,
    };

    // Encrypt if needed
    if (process.env.ENCRYPT_RESPONSES === "true") {
      try {
        const encryptedData = encryptData(responseData);
        return res.status(HTTP_STATUS.OK).json({
          encrypted: true,
          data: encryptedData,
        });
      } catch (error) {
        console.error("Encryption error:", error);
        // Fall back to unencrypted response
      }
    }

    res.status(HTTP_STATUS.OK).json(responseData);
  }
);

/**
 * Get campaigns joined by a specific user
 * @route POST /api/campaigns/fetch/user-joined
 */

// Modified function - don't return the response object
export const Get_User_Joined_Campaigns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, status } = req.body;
    // Extract pagination parameters from query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Basic validation
    if (!userId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "User ID is required",
        statusCode: HTTP_STATUS.BAD_REQUEST,
      });
      return;
    }

    // Get joined campaigns from service with pagination
    const { campaigns, total, pages } = await campaignService.getUserJoinedCampaigns(
      userId,
      status,
      page,
      limit
    );

    // Send success response with pagination info
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User joined campaigns retrieved successfully",
      data: campaigns,
      pagination: {
        total,
        page,
        pages,
        limit,
      },
    });
  } catch (error) {
    console.error("Controller error in Get_User_Joined_Campaigns:", error);

    // Handle AppError instances
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode,
      });
    } else {
      // Handle other errors
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while fetching joined campaigns",
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  }
};

// Ensure all your other controller functions follow the same pattern
// Don't return the res.json() calls
