import campaignRepository from "../repositories/campaignRepository";
import {
  CampaignDTO,
  CampaignStatus,
  CreateCampaignRequest,
  JoinCampaignRequest,
  UpdateLeaderboardPointsRequest,
  CampaignParticipantDTO,
} from "../types/campaigns";
import { AppError } from "../utils/error-handler";
import { HTTP_STATUS } from "../constants/http-status";

class CampaignService {
  // Create a new campaign
  async createCampaign(
    campaignData: CreateCampaignRequest
  ): Promise<CampaignDTO> {
    try {
      const campaign = await campaignRepository.createCampaign(campaignData);

      return {
        campaignId: campaign.campaignId,
        leaderBoardId: campaign.leaderBoardId ?? undefined,
        banner: campaign.banner,
        title: campaign.title,
        description: campaign.description,
        organiserLogo: campaign.organiserLogo,
        organiserLink: campaign.organiserLink,
        rewardPool: campaign.rewardPool,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      };
    } catch (error) {
      console.error("Error in createCampaign service:", error);
      throw error;
    }
  }

  // Join a campaign
  async joinCampaign(
    joinRequest: JoinCampaignRequest
  ): Promise<{ message: string }> {
    try {
      await campaignRepository.joinCampaign(
        joinRequest.campaignId,
        joinRequest.userId
      );
      return { message: "Successfully joined campaign" };
    } catch (error) {
      console.error("Error in joinCampaign service:", error);
      throw error;
    }
  }

  // Get a single campaign by ID
  async getCampaignById(campaignId: string): Promise<CampaignDTO> {
    try {
      const campaign = await campaignRepository.getCampaignById(campaignId);

      // Format the response
      const campaignDTO: CampaignDTO = {
        campaignId: campaign.campaignId,
        leaderBoardId: campaign.leaderBoardId ?? undefined,
        banner: campaign.banner,
        title: campaign.title,
        description: campaign.description,
        organiserLogo: campaign.organiserLogo,
        organiserLink: campaign.organiserLink,
        rewardPool: campaign.rewardPool,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        participants: campaign.participants?.map((p) => ({
          campaignParticipantId: p.campaignParticipantId,
          campaignId: p.campaignId,
          userId: p.userId,
          joinedAt: p.joinedAt,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          user: p.user
            ? {
                userId: p.user.userId,
                web3UserName: p.user.web3UserName,
              }
            : undefined,
        })),
      };

      return campaignDTO;
    } catch (error) {
      console.error("Error in getCampaignById service:", error);
      throw error;
    }
  }

  // Get all campaigns with pagination
  // Get all campaigns with pagination
async getAllCampaigns(
  page: number = 1,
  limit: number = 10
): Promise<{ campaigns: CampaignDTO[]; total: number; pages: number }> {
  try {
    const { campaigns, total, pages } =
      await campaignRepository.getAllCampaigns(page, limit);

    // Map to DTO with participants included
    const campaignDTOs = campaigns.map((campaign) => {
      // First map the participants to a simplified format
      const participants = campaign.participants?.map(participant => {
        // Skip if user is undefined
        if (!participant.user) {
          return null;
        }
        
        // Get the first profile picture from social handles if available
        const profilePicture = participant.user?.socialHandles && 
                              participant.user.socialHandles.length > 0 ? 
                              participant.user.socialHandles[0].profilePicture : 
                              undefined;
        
        return {
          campaignParticipantId: participant.campaignParticipantId,
          campaignId: participant.campaignId, // Added this missing required field
          userId: participant.userId,
          joinedAt: participant.joinedAt,
          user: {
            userId: participant.user.userId,
            web3UserName: participant.user.web3UserName,
            profilePicture: profilePicture
          }
        };
      }).filter(Boolean) as CampaignParticipantDTO[]; // Filter out null values and assert type

      // Then create the campaign DTO with participants included
      return {
        campaignId: campaign.campaignId,
        leaderBoardId: campaign.leaderBoardId ?? undefined,
        banner: campaign.banner,
        title: campaign.title,
        description: campaign.description,
        organiserLogo: campaign.organiserLogo,
        organiserLink: campaign.organiserLink,
        rewardPool: campaign.rewardPool,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        // Include participants count and list
        participantsCount: participants.length,
        participants: participants
      };
    });

    return {
      campaigns: campaignDTOs,
      total,
      pages,
    };
  } catch (error) {
    console.error("Error in getAllCampaigns service:", error);
    throw error;
  }
}
   

  // Get filtered campaigns
  async getFilteredCampaigns(
    status: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    campaigns: CampaignDTO[];
    total: number;
    pages: number;
    filter: string;
  }> {
    try {
      // Validate and convert status
      let campaignStatus: CampaignStatus;

      switch (status.toLowerCase()) {
        case "active":
          campaignStatus = CampaignStatus.ACTIVE;
          break;
        case "upcoming":
          campaignStatus = CampaignStatus.UPCOMING;
          break;
        case "inactive": 
        case "past":
        case "expired":
          campaignStatus = CampaignStatus.PAST;
          break;
        case "all":
          campaignStatus = CampaignStatus.ALL;
          break;
        default:
          throw new AppError(
            `Invalid status filter: ${status}`,
            HTTP_STATUS.BAD_REQUEST
          );
      }

      const { campaigns, total, pages } =
        await campaignRepository.getFilteredCampaigns(
          campaignStatus,
          page,
          limit
        );

      // Map to DTO
      const campaignDTOs = campaigns.map((campaign) => ({
        campaignId: campaign.campaignId,
        leaderBoardId: campaign.leaderBoardId ?? undefined,
        banner: campaign.banner,
        title: campaign.title,
        description: campaign.description,
        organiserLogo: campaign.organiserLogo,
        organiserLink: campaign.organiserLink,
        rewardPool: campaign.rewardPool,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      }));

      return {
        campaigns: campaignDTOs,
        total,
        pages,
        filter: status.toLowerCase(),
      };
    } catch (error) {
      console.error("Error in getFilteredCampaigns service:", error);
      throw error;
    }
  }

  // Update leaderboard points
  async updateLeaderboardPoints(
    updateRequest: UpdateLeaderboardPointsRequest
  ): Promise<{ message: string }> {
    try {
      await campaignRepository.updateLeaderboardPoints(
        updateRequest.leaderBoardId,
        updateRequest.userId,
        updateRequest.points
      );

      return { message: "Leaderboard points updated successfully" };
    } catch (error) {
      console.error("Error in updateLeaderboardPoints service:", error);
      throw error;
    }
  }

 // Get campaigns joined by a user with pagination
// async getUserJoinedCampaigns(
//   userId: string, 
//   status?: string,
//   page: number = 1,
//   limit: number = 10
// ): Promise<{campaigns: any[], total: number, pages: number}> {
//   try {
//     // Validate UUID format
//     if (userId) {
//       const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//       if (!uuidRegex.test(userId)) {
//         throw new AppError('Invalid User ID format', HTTP_STATUS.BAD_REQUEST);
//       }
//     } else {
//       throw new AppError('User ID is required', HTTP_STATUS.BAD_REQUEST);
//     }
    
//     // Validate status if provided
//     if (status && !['active', 'inactive', 'true', 'false', 'all'].includes(status)) {
//       throw new AppError(
//         'Invalid status parameter. Use "active", "inactive", or "all"', 
//         HTTP_STATUS.BAD_REQUEST
//       );
//     }

//     // Validate pagination parameters
//     if (page < 1) {
//       throw new AppError('Page must be at least 1', HTTP_STATUS.BAD_REQUEST);
//     }
    
//     if (limit < 1 || limit > 100) {
//       throw new AppError('Limit must be between 1 and 100', HTTP_STATUS.BAD_REQUEST);
//     }
    
//     // Get campaigns from repository with pagination
//     const { campaigns, total, pages } = await campaignRepository.getUserJoinedCampaigns(
//       userId, 
//       status,
//       page,
//       limit
//     );
    
//     return { campaigns, total, pages };
//   } catch (error) {
//     // Pass through AppErrors
//     if (error instanceof AppError) {
//       throw error;
//     }
    
//     // Log and wrap other errors
//     console.error('Service error in getUserJoinedCampaigns:', error);
//     throw new AppError(
//       'Failed to retrieve user joined campaigns', 
//       HTTP_STATUS.INTERNAL_SERVER_ERROR
//     );
//   }
// }
async getUserJoinedCampaigns(
  userId: string, 
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{campaigns: any[], total: number, pages: number}> {
  try {
    // Validate UUID format
    if (userId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new AppError('Invalid User ID format', HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      throw new AppError('User ID is required', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Validate status if provided
    if (status && !['active', 'inactive', 'true', 'false', 'all'].includes(status)) {
      throw new AppError(
        'Invalid status parameter. Use "active", "inactive", or "all"', 
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate pagination parameters
    if (page < 1) {
      throw new AppError('Page must be at least 1', HTTP_STATUS.BAD_REQUEST);
    }
    
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Get campaigns from repository with pagination and leaderboard data
    const { campaigns, total, pages } = await campaignRepository.getUserJoinedCampaigns(
      userId, 
      status,
      page,
      limit
    );

    // Type validation has already been done in the repository
    return { campaigns, total, pages };
  } catch (error) {
    // Pass through AppErrors
    if (error instanceof AppError) {
      throw error;
    }
    
    // Log and wrap other errors
    console.error('Service error in getUserJoinedCampaigns:', error);
    throw new AppError(
      'Failed to retrieve user joined campaigns', 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
}
export default new CampaignService();
