"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Campaign_1 = __importDefault(require("../models/Campaign"));
const CampaignParticipant_1 = __importDefault(require("../models/CampaignParticipant"));
const CampaignLeaderBoard_1 = __importDefault(require("../models/CampaignLeaderBoard"));
const CampaignLeaderBoardUser_1 = __importDefault(require("../models/CampaignLeaderBoardUser"));
const User_1 = __importDefault(require("../models/User"));
const campaigns_1 = require("../types/campaigns");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
class CampaignRepository {
    // Create a new campaign and automatically create its leaderboard
    async createCampaign(campaignData) {
        const transaction = await Campaign_1.default.sequelize.transaction();
        try {
            // First create the campaign without leaderboard reference
            const campaign = await Campaign_1.default.create({
                ...campaignData,
                status: campaignData.status !== undefined ? campaignData.status : true, // Default to true if not provided
                leaderBoardId: null, // Start with null reference
            }, { transaction });
            // Now create the leaderboard with valid campaign reference
            const leaderBoard = await CampaignLeaderBoard_1.default.create({
                campaignId: campaign.campaignId, // Use the actual campaign ID
            }, { transaction });
            // Update the campaign with leaderboard reference
            await campaign.update({
                leaderBoardId: leaderBoard.leaderBoardId,
            }, { transaction });
            await transaction.commit();
            // Reload to get fresh data with all relations
            const updatedCampaign = await Campaign_1.default.findByPk(campaign.campaignId);
            if (!updatedCampaign) {
                throw new Error("Failed to retrieve campaign after creation");
            }
            return updatedCampaign;
        }
        catch (error) {
            await transaction.rollback();
            console.error("Error creating campaign:", error);
            throw error;
        }
    }
    // Join a campaign (create participant record)
    async joinCampaign(campaignId, userId) {
        try {
            // Check if campaign exists and is active
            const campaign = await Campaign_1.default.findByPk(campaignId);
            if (!campaign) {
                throw new error_handler_1.AppError("Campaign not found", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!campaign.status) {
                throw new error_handler_1.AppError("Campaign is not active", http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const now = new Date();
            if (now < campaign.startDate) {
                throw new error_handler_1.AppError("Campaign has not started yet", http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (now > campaign.endDate) {
                throw new error_handler_1.AppError("Campaign has already ended", http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Check if user exists
            const user = await User_1.default.findByPk(userId);
            if (!user) {
                throw new error_handler_1.AppError("User not found", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            // Check if user already joined this campaign
            const existingParticipant = await CampaignParticipant_1.default.findOne({
                where: {
                    campaignId,
                    userId,
                },
            });
            if (existingParticipant) {
                throw new error_handler_1.AppError("User already joined this campaign", http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Create campaign participant record
            const participant = await CampaignParticipant_1.default.create({
                campaignId,
                userId,
                joinedAt: new Date(),
            });
            // Initialize user in leaderboard with 0 points
            await CampaignLeaderBoardUser_1.default.create({
                leaderBoardId: campaign.leaderBoardId,
                userId,
                userName: user.web3UserName,
                ranking: 0, // Will be calculated later
                points: 0,
            });
            return participant;
        }
        catch (error) {
            console.error("Error joining campaign:", error);
            throw error;
        }
    }
    // Get a single campaign by ID
    async getCampaignById(campaignId) {
        try {
            const campaign = await Campaign_1.default.findByPk(campaignId, {
                include: [
                    {
                        model: CampaignParticipant_1.default,
                        as: "participants",
                        include: [
                            {
                                model: User_1.default,
                                as: "user",
                                attributes: ["userId", "web3UserName"],
                            },
                        ],
                    },
                    {
                        model: CampaignLeaderBoard_1.default,
                        as: "leaderBoard",
                        include: [
                            {
                                model: CampaignLeaderBoardUser_1.default,
                                as: "leaderboardUsers",
                                attributes: ["userId", "userName", "ranking", "points"],
                                order: [["points", "DESC"]],
                            },
                        ],
                    },
                ],
            });
            if (!campaign) {
                throw new error_handler_1.AppError("Campaign not found", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            return campaign;
        }
        catch (error) {
            console.error("Error getting campaign:", error);
            throw error;
        }
    }
    // Get all campaigns with pagination
    async getAllCampaigns(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await Campaign_1.default.findAndCountAll({
                limit,
                offset,
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: CampaignLeaderBoard_1.default,
                        as: "leaderBoard",
                    },
                ],
            });
            return {
                campaigns: rows,
                total: count,
                pages: Math.ceil(count / limit),
            };
        }
        catch (error) {
            console.error("Error getting all campaigns:", error);
            throw error;
        }
    }
    // Get filtered campaigns
    async getFilteredCampaigns(status, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const now = new Date();
            let whereClause = {};
            // Apply filter based on status
            switch (status) {
                case campaigns_1.CampaignStatus.ACTIVE:
                    whereClause = {
                        status: true,
                        startDate: { [sequelize_1.Op.lte]: now },
                        endDate: { [sequelize_1.Op.gte]: now },
                    };
                    break;
                case campaigns_1.CampaignStatus.UPCOMING:
                    whereClause = {
                        status: true,
                        startDate: { [sequelize_1.Op.gt]: now },
                    };
                    break;
                case campaigns_1.CampaignStatus.PAST:
                    whereClause = {
                        endDate: { [sequelize_1.Op.lt]: now },
                    };
                    break;
                case campaigns_1.CampaignStatus.ALL:
                default:
                    // No filters for 'all'
                    break;
            }
            const { count, rows } = await Campaign_1.default.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [["startDate", "DESC"]],
                include: [
                    {
                        model: CampaignLeaderBoard_1.default,
                        as: "leaderBoard",
                    },
                ],
            });
            return {
                campaigns: rows,
                total: count,
                pages: Math.ceil(count / limit),
            };
        }
        catch (error) {
            console.error("Error getting filtered campaigns:", error);
            throw error;
        }
    }
    // Update leaderboard points
    async updateLeaderboardPoints(leaderBoardId, userId, points) {
        try {
            const leaderboardUser = await CampaignLeaderBoardUser_1.default.findOne({
                where: {
                    leaderBoardId,
                    userId,
                },
            });
            if (!leaderboardUser) {
                throw new error_handler_1.AppError("User not found in leaderboard", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            // Update points
            leaderboardUser.points += points;
            await leaderboardUser.save();
            // Recalculate rankings for all users in this leaderboard
            await this.recalculateRankings(leaderBoardId);
            return leaderboardUser;
        }
        catch (error) {
            console.error("Error updating leaderboard points:", error);
            throw error;
        }
    }
    // Helper to recalculate rankings
    async recalculateRankings(leaderBoardId) {
        try {
            // Get all users in leaderboard ordered by points
            const users = await CampaignLeaderBoardUser_1.default.findAll({
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
                }
                else {
                    // Different points, assign new rank (accounting for ties)
                    currentRank += skipCount;
                    skipCount = 0;
                }
                user.ranking = currentRank;
                await user.save();
                previousPoints = user.points;
            }
        }
        catch (error) {
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
    async getUserJoinedCampaigns(userId, status, page = 1, limit = 10) {
        try {
            // Validate input
            if (!userId) {
                throw new error_handler_1.AppError("User ID is required", http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Check if user exists
            const userExists = await User_1.default.findByPk(userId);
            if (!userExists) {
                throw new error_handler_1.AppError("User not found", http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            // Calculate offset for pagination
            const offset = (page - 1) * limit;
            // Build the query with joins, conditions, and pagination
            const queryOptions = {
                where: { userId },
                include: [
                    {
                        model: Campaign_1.default,
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
            const totalCount = await CampaignParticipant_1.default.count({
                where: { userId },
                include: [
                    {
                        model: Campaign_1.default,
                        as: "campaign",
                        where: status && status !== "all"
                            ? { status: status === "true" || status === "active" ? true : false }
                            : undefined
                    },
                ],
            });
            // Execute the query using CampaignParticipant model
            const participants = await CampaignParticipant_1.default.findAll(queryOptions);
            // Calculate real-time status for each campaign
            const now = new Date();
            const result = participants
                .map((participant) => {
                const campaign = participant.get("campaign");
                if (!campaign) {
                    return null;
                }
                // Calculate real-time status based on dates
                let realTimeStatus = "upcoming";
                if (now > new Date(campaign.endDate)) {
                    realTimeStatus = "completed";
                }
                else if (now >= new Date(campaign.startDate)) {
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
        }
        catch (error) {
            console.error("Error fetching joined campaigns:", error);
            // Handle database column errors
            if (typeof error === 'object' && error !== null &&
                'name' in error && error.name === 'SequelizeDatabaseError' &&
                'parent' in error && error.parent &&
                typeof error.parent === 'object' && error.parent !== null &&
                'code' in error.parent && error.parent.code === '42703') {
                console.error("Column not found error. Check your model definition and database schema.");
                throw new error_handler_1.AppError("Database schema mismatch. Please contact support.", http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            if (error instanceof error_handler_1.AppError) {
                throw error;
            }
            throw new error_handler_1.AppError("Failed to fetch joined campaigns", http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.default = new CampaignRepository();
//# sourceMappingURL=campaignRepository.js.map