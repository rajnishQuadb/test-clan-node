"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const campaignRepository_1 = __importDefault(require("../repositories/campaignRepository"));
const campaigns_1 = require("../types/campaigns");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
class CampaignService {
    // Create a new campaign
    async createCampaign(campaignData) {
        try {
            const campaign = await campaignRepository_1.default.createCampaign(campaignData);
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
        }
        catch (error) {
            console.error('Error in createCampaign service:', error);
            throw error;
        }
    }
    // Join a campaign
    async joinCampaign(joinRequest) {
        try {
            await campaignRepository_1.default.joinCampaign(joinRequest.campaignId, joinRequest.userId);
            return { message: 'Successfully joined campaign' };
        }
        catch (error) {
            console.error('Error in joinCampaign service:', error);
            throw error;
        }
    }
    // Get a single campaign by ID
    async getCampaignById(campaignId) {
        try {
            const campaign = await campaignRepository_1.default.getCampaignById(campaignId);
            // Format the response
            const campaignDTO = {
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
        }
        catch (error) {
            console.error('Error in getCampaignById service:', error);
            throw error;
        }
    }
    // Get all campaigns with pagination
    async getAllCampaigns(page = 1, limit = 10) {
        try {
            const { campaigns, total, pages } = await campaignRepository_1.default.getAllCampaigns(page, limit);
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
        }
        catch (error) {
            console.error('Error in getAllCampaigns service:', error);
            throw error;
        }
    }
    // Get filtered campaigns
    async getFilteredCampaigns(status, page = 1, limit = 10) {
        try {
            // Validate and convert status
            let campaignStatus;
            switch (status.toLowerCase()) {
                case 'active':
                    campaignStatus = campaigns_1.CampaignStatus.ACTIVE;
                    break;
                case 'upcoming':
                    campaignStatus = campaigns_1.CampaignStatus.UPCOMING;
                    break;
                case 'past':
                case 'expired':
                    campaignStatus = campaigns_1.CampaignStatus.PAST;
                    break;
                case 'all':
                    campaignStatus = campaigns_1.CampaignStatus.ALL;
                    break;
                default:
                    throw new error_handler_1.AppError(`Invalid status filter: ${status}`, http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { campaigns, total, pages } = await campaignRepository_1.default.getFilteredCampaigns(campaignStatus, page, limit);
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
        }
        catch (error) {
            console.error('Error in getFilteredCampaigns service:', error);
            throw error;
        }
    }
    // Update leaderboard points
    async updateLeaderboardPoints(updateRequest) {
        try {
            await campaignRepository_1.default.updateLeaderboardPoints(updateRequest.leaderBoardId, updateRequest.userId, updateRequest.points);
            return { message: 'Leaderboard points updated successfully' };
        }
        catch (error) {
            console.error('Error in updateLeaderboardPoints service:', error);
            throw error;
        }
    }
}
exports.default = new CampaignService();
//# sourceMappingURL=campaignService.js.map