import campaignRepository from '../repositories/campaignRepository';
import { CampaignDTO, CampaignStatus, CreateCampaignRequest, JoinCampaignRequest, UpdateLeaderboardPointsRequest } from '../types/campaigns';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

class CampaignService {
  // Create a new campaign
  async createCampaign(campaignData: CreateCampaignRequest): Promise<CampaignDTO> {
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
        updatedAt: campaign.updatedAt
      };
    } catch (error) {
      console.error('Error in createCampaign service:', error);
      throw error;
    }
  }
  
  // Join a campaign
  async joinCampaign(joinRequest: JoinCampaignRequest): Promise<{ message: string }> {
    try {
      await campaignRepository.joinCampaign(joinRequest.campaignId, joinRequest.userId);
      return { message: 'Successfully joined campaign' };
    } catch (error) {
      console.error('Error in joinCampaign service:', error);
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
        participants: campaign.participants?.map(p => ({
          campaignParticipantId: p.campaignParticipantId,
          campaignId: p.campaignId,
          userId: p.userId,
          joinedAt: p.joinedAt,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          user: p.user ? {
            userId: p.user.userId,
            web3UserName: p.user.web3UserName
          } : undefined
        }))
      };
      
      return campaignDTO;
    } catch (error) {
      console.error('Error in getCampaignById service:', error);
      throw error;
    }
  }
  
  // Get all campaigns with pagination
  async getAllCampaigns(page: number = 1, limit: number = 10): Promise<{ campaigns: CampaignDTO[], total: number, pages: number }> {
    try {
      const { campaigns, total, pages } = await campaignRepository.getAllCampaigns(page, limit);
      
      // Map to DTO
      const campaignDTOs = campaigns.map(campaign => ({
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
        updatedAt: campaign.updatedAt
      }));
      
      return {
        campaigns: campaignDTOs,
        total,
        pages
      };
    } catch (error) {
      console.error('Error in getAllCampaigns service:', error);
      throw error;
    }
  }
  
  // Get filtered campaigns
  async getFilteredCampaigns(status: string, page: number = 1, limit: number = 10): Promise<{ campaigns: CampaignDTO[], total: number, pages: number, filter: string }> {
    try {
      // Validate and convert status
      let campaignStatus: CampaignStatus;
      
      switch (status.toLowerCase()) {
        case 'active':
          campaignStatus = CampaignStatus.ACTIVE;
          break;
        case 'upcoming':
          campaignStatus = CampaignStatus.UPCOMING;
          break;
        case 'past':
        case 'expired':
          campaignStatus = CampaignStatus.PAST;
          break;
        case 'all':
          campaignStatus = CampaignStatus.ALL;
          break;
        default:
          throw new AppError(`Invalid status filter: ${status}`, HTTP_STATUS.BAD_REQUEST);
      }
      
      const { campaigns, total, pages } = await campaignRepository.getFilteredCampaigns(campaignStatus, page, limit);
      
      // Map to DTO
      const campaignDTOs = campaigns.map(campaign => ({
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
        updatedAt: campaign.updatedAt
      }));
      
      return {
        campaigns: campaignDTOs,
        total,
        pages,
        filter: status.toLowerCase()
      };
    } catch (error) {
      console.error('Error in getFilteredCampaigns service:', error);
      throw error;
    }
  }
  
  // Update leaderboard points
  async updateLeaderboardPoints(updateRequest: UpdateLeaderboardPointsRequest): Promise<{ message: string }> {
    try {
      await campaignRepository.updateLeaderboardPoints(
        updateRequest.leaderBoardId,
        updateRequest.userId,
        updateRequest.points
      );
      
      return { message: 'Leaderboard points updated successfully' };
    } catch (error) {
      console.error('Error in updateLeaderboardPoints service:', error);
      throw error;
    }
  }
}

export default new CampaignService();