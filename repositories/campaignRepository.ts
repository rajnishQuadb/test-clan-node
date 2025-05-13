import { Op } from "sequelize";
import Campaign from "../models/Campaign";
import CampaignParticipant from "../models/CampaignParticipant";
import CampaignLeaderBoard from "../models/CampaignLeaderBoard";
import CampaignLeaderBoardUser from "../models/CampaignLeaderBoardUser";
import User from "../models/User";
import {
  CampaignDTO,
  CampaignStatus,
  CreateCampaignRequest,
} from "../types/campaigns";
import { AppError } from "../utils/error-handler";
import { HTTP_STATUS } from "../constants/http-status";

class CampaignRepository {
  // Create a new campaign and automatically create its leaderboard
  async createCampaign(campaignData: CreateCampaignRequest): Promise<Campaign> {
    const transaction = await Campaign.sequelize!.transaction();

    try {
      // First create the campaign without leaderboard reference
      const campaign = await Campaign.create(
        {
          ...campaignData,
          status:
            campaignData.status !== undefined ? campaignData.status : true, // Default to true if not provided
          leaderBoardId: null, // Start with null reference
        },
        { transaction }
      );

      // Now create the leaderboard with valid campaign reference
      const leaderBoard = await CampaignLeaderBoard.create(
        {
          campaignId: campaign.campaignId, // Use the actual campaign ID
        },
        { transaction }
      );

      // Update the campaign with leaderboard reference
      await campaign.update(
        {
          leaderBoardId: leaderBoard.leaderBoardId,
        },
        { transaction }
      );

      await transaction.commit();

      // Reload to get fresh data with all relations
      const updatedCampaign = await Campaign.findByPk(campaign.campaignId);
      if (!updatedCampaign) {
        throw new Error("Failed to retrieve campaign after creation");
      }
      return updatedCampaign;
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating campaign:", error);
      throw error;
    }
  }

  // Join a campaign (create participant record)
  async joinCampaign(
    campaignId: string,
    userId: string
  ): Promise<CampaignParticipant> {
    try {
      // Check if campaign exists and is active
      const campaign = await Campaign.findByPk(campaignId);
      if (!campaign) {
        throw new AppError("Campaign not found", HTTP_STATUS.NOT_FOUND);
      }

      if (!campaign.status) {
        throw new AppError("Campaign is not active", HTTP_STATUS.BAD_REQUEST);
      }

      const now = new Date();
      if (now < campaign.startDate) {
        throw new AppError(
          "Campaign has not started yet",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      if (now > campaign.endDate) {
        throw new AppError(
          "Campaign has already ended",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
      }

      // Check if user already joined this campaign
      const existingParticipant = await CampaignParticipant.findOne({
        where: {
          campaignId,
          userId,
        },
      });

      if (existingParticipant) {
        throw new AppError(
          "User already joined this campaign",
          HTTP_STATUS.BAD_REQUEST
        );
      }

      // Create campaign participant record
      const participant = await CampaignParticipant.create({
        campaignId,
        userId,
        joinedAt: new Date(),
      });

      // Initialize user in leaderboard with 0 points
      await CampaignLeaderBoardUser.create({
        leaderBoardId: campaign.leaderBoardId!,
        userId,
        userName: user.web3UserName,
        ranking: 0, // Will be calculated later
        points: 0,
      });

      return participant;
    } catch (error) {
      console.error("Error joining campaign:", error);
      throw error;
    }
  }

  // Get a single campaign by ID
  async getCampaignById(campaignId: string): Promise<Campaign> {
    try {
      const campaign = await Campaign.findByPk(campaignId, {
        include: [
          {
            model: CampaignParticipant,
            as: "participants",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["userId", "web3UserName"],
              },
            ],
          },
          {
            model: CampaignLeaderBoard,
            as: "leaderBoard",
            include: [
              {
                model: CampaignLeaderBoardUser,
                as: "leaderboardUsers",
                attributes: ["userId", "userName", "ranking", "points"],
                order: [["points", "DESC"]],
              },
            ],
          },
        ],
      });

      if (!campaign) {
        throw new AppError("Campaign not found", HTTP_STATUS.NOT_FOUND);
      }

      return campaign;
    } catch (error) {
      console.error("Error getting campaign:", error);
      throw error;
    }
  }

  // Get all campaigns with pagination
  async getAllCampaigns(
    page: number = 1,
    limit: number = 10
  ): Promise<{ campaigns: Campaign[]; total: number; pages: number }> {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await Campaign.findAndCountAll({
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: CampaignLeaderBoard,
            as: "leaderBoard",
          },
        ],
      });

      return {
        campaigns: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error("Error getting all campaigns:", error);
      throw error;
    }
  }

  // Get filtered campaigns
  async getFilteredCampaigns(
    status: CampaignStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ campaigns: Campaign[]; total: number; pages: number }> {
    try {
      const offset = (page - 1) * limit;
      const now = new Date();

      let whereClause: any = {};

      // Apply filter based on status
      switch (status) {
        case CampaignStatus.ACTIVE:
          whereClause = {
            status: true,
            startDate: { [Op.lte]: now },
            endDate: { [Op.gte]: now },
          };
          break;
        case CampaignStatus.UPCOMING:
          whereClause = {
            status: true,
            startDate: { [Op.gt]: now },
          };
          break;
        case CampaignStatus.PAST:
          whereClause = {
            endDate: { [Op.lt]: now },
          };
          break;
        case CampaignStatus.ALL:
        default:
          // No filters for 'all'
          break;
      }

      const { count, rows } = await Campaign.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["startDate", "DESC"]],
        include: [
          {
            model: CampaignLeaderBoard,
            as: "leaderBoard",
          },
        ],
      });

      return {
        campaigns: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error("Error getting filtered campaigns:", error);
      throw error;
    }
  }

  // Update leaderboard points
  async updateLeaderboardPoints(
    leaderBoardId: string,
    userId: string,
    points: number
  ): Promise<CampaignLeaderBoardUser> {
    try {
      const leaderboardUser = await CampaignLeaderBoardUser.findOne({
        where: {
          leaderBoardId,
          userId,
        },
      });

      if (!leaderboardUser) {
        throw new AppError(
          "User not found in leaderboard",
          HTTP_STATUS.NOT_FOUND
        );
      }

      // Update points
      leaderboardUser.points += points;
      await leaderboardUser.save();

      // Recalculate rankings for all users in this leaderboard
      await this.recalculateRankings(leaderBoardId);

      return leaderboardUser;
    } catch (error) {
      console.error("Error updating leaderboard points:", error);
      throw error;
    }
  }

  // Helper to recalculate rankings
  private async recalculateRankings(leaderBoardId: string): Promise<void> {
    try {
      // Get all users in leaderboard ordered by points
      const users = await CampaignLeaderBoardUser.findAll({
        where: { leaderBoardId },
        order: [["points", "DESC"]],
      });

      // Update rankings (handle ties by giving same rank)
      let currentRank = 1;
      let previousPoints = -1;
      let skipCount = 0;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        if (previousPoints === user.points) {
          // Same points as previous user, keep same rank
          skipCount++;
        } else {
          // Different points, assign new rank (accounting for ties)
          currentRank += skipCount;
          skipCount = 0;
        }

        user.ranking = currentRank;
        await user.save();

        previousPoints = user.points;
      }
    } catch (error) {
      console.error("Error recalculating rankings:", error);
      throw error;
    }
  }

  // Get campaigns joined by a specific user with optional status filter
  // async getUserJoinedCampaigns(
  //   userId: string,
  //   status?: string
  // ): Promise<any[]> {
  //   try {
  //     // Validate input
  //     if (!userId) {
  //       throw new AppError("User ID is required", HTTP_STATUS.BAD_REQUEST);
  //     }

  //     // Check if user exists
  //     const userExists = await User.findByPk(userId);
  //     if (!userExists) {
  //       throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  //     }

  //     // Build the query with joins and conditions
  //     const queryOptions: any = {
  //       where: { userId },
  //       include: [
  //         {
  //           model: Campaign,
  //           as: "campaign", // Changed to match your associations.ts file
  //           attributes: [
  //             "campaignId",
  //             "title",
  //             "description",
  //             "startDate",
  //             "endDate",
  //             "status",
  //             "imageUrl",
  //             "leaderBoardId",
  //           ],
  //         },
  //       ],
  //       order: [["joinedAt", "DESC"]],
  //     };

  //     // Add status filter if provided and not 'all'
  //     if (status && status !== "all") {
  //       // Apply the status filter to the campaign model
  //       if (!queryOptions.include[0].where) {
  //         queryOptions.include[0].where = {};
  //       }
  //       queryOptions.include[0].where.status =
  //         status === "true" || status === "active" ? true : false;
  //     }

  //     // Execute the query using CampaignParticipant model
  //     const participants = await CampaignParticipant.findAll(queryOptions);

  //     // Calculate real-time status for each campaign
  //     const now = new Date();
  //     const result = participants
  //       .map((participant) => {
  //         // Type assertion to fix the TypeScript error
  //         const campaign = participant.get("campaign") as any;

  //         // Skip if campaign data is missing (shouldn't happen with proper relations)
  //         if (!campaign) {
  //           return null;
  //         }

  //         // Calculate real-time status based on dates
  //         let realTimeStatus = "upcoming";
  //         if (now > new Date(campaign.endDate)) {
  //           realTimeStatus = "completed";
  //         } else if (now >= new Date(campaign.startDate)) {
  //           realTimeStatus = "active";
  //         }

  //         return {
  //           participantId: participant.campaignParticipantId,
  //           joinedAt: participant.joinedAt,
  //           campaign: {
  //             ...campaign.get(), // Using get() instead of toJSON()
  //             realTimeStatus,
  //           },
  //         };
  //       })
  //       .filter(Boolean); // Remove any null entries

  //     return result;
  //   } catch (error) {
  //     console.error("Error fetching joined campaigns:", error);
  //     if (error instanceof AppError) {
  //       throw error;
  //     }
  //     throw new AppError(
  //       "Failed to fetch joined campaigns",
  //       HTTP_STATUS.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
  // Get campaigns joined by a specific user with optional status filter
// Get campaigns joined by a specific user with optional status filter and pagination
async getUserJoinedCampaigns(
  userId: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{ campaigns: any[], total: number, pages: number }> {
  try {
    // Validate input
    if (!userId) {
      throw new AppError("User ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    // Check if user exists
    const userExists = await User.findByPk(userId);
    if (!userExists) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query with joins, conditions, and pagination
    const queryOptions: any = {
      where: { userId },
      include: [
        {
          model: Campaign,
          as: "campaign",
          attributes: [
            "campaignId",
            "title",
            "description",
            "startDate",
            "endDate",
            "status",
            "banner",
            "leaderBoardId",
            "rewardPool",
            "organiserLogo",
            "organiserLink"
          ],
        },
      ],
      order: [["joinedAt", "DESC"]],
      limit,
      offset
    };

    // Add status filter if provided and not 'all'
    if (status && status !== "all") {
      if (!queryOptions.include[0].where) {
        queryOptions.include[0].where = {};
      }
      queryOptions.include[0].where.status =
        status === "true" || status === "active" ? true : false;
    }

    // Count total records (for pagination)
    const totalCount = await CampaignParticipant.count({
      where: { userId },
      include: [
        {
          model: Campaign,
          as: "campaign",
          where: status && status !== "all" 
            ? { status: status === "true" || status === "active" ? true : false } 
            : undefined
        },
      ],
    });

    // Execute the query using CampaignParticipant model
    const participants = await CampaignParticipant.findAll(queryOptions);

    // Calculate real-time status for each campaign
    const now = new Date();
    const result = participants
      .map((participant) => {
        const campaign = participant.get("campaign") as any;

        if (!campaign) {
          return null;
        }

        // Calculate real-time status based on dates
        let realTimeStatus = "upcoming";
        if (now > new Date(campaign.endDate)) {
          realTimeStatus = "completed";
        } else if (now >= new Date(campaign.startDate)) {
          realTimeStatus = "active";
        }

        return {
          participantId: participant.campaignParticipantId,
          joinedAt: participant.joinedAt,
          campaign: {
            ...campaign,
            imageUrl: campaign.banner, // Map banner to imageUrl for API compatibility
            realTimeStatus,
          },
        };
      })
      .filter(Boolean);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      campaigns: result,
      total: totalCount,
      pages: totalPages
    };
  } catch (error: unknown) {
    console.error("Error fetching joined campaigns:", error);
    
    // Handle database column errors
    if (typeof error === 'object' && error !== null && 
        'name' in error && error.name === 'SequelizeDatabaseError' && 
        'parent' in error && error.parent && 
        typeof error.parent === 'object' && error.parent !== null &&
        'code' in error.parent && (error.parent as any).code === '42703') {
      
      console.error("Column not found error. Check your model definition and database schema.");
      throw new AppError(
        "Database schema mismatch. Please contact support.",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      "Failed to fetch joined campaigns",
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
}

export default new CampaignRepository();
