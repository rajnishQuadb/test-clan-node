"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clanRepository_1 = __importDefault(require("../repositories/clanRepository"));
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
class ClanService {
    async createClan(clanData) {
        if (!clanData.title || !clanData.description || !clanData.banner) {
            throw new error_handler_1.AppError('Missing required fields: title, description, and banner are required.', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        // You could add validation here for existing leaderboardId, etc.
        const createdClan = await clanRepository_1.default.createClan(clanData);
        // After Clan is created, create ClanLeaderBoard
        return createdClan;
    }
    // Service to fetch clan details
    // async getClan(clanId: string): Promise<ClanDTO | null> {
    //   // Check if the clanId is valid
    //   if (!clanId) {
    //     throw new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST);
    //   }
    //   try {
    //     // Fetch the clan from the repository
    //     const clan = await clanRepository.getClan(clanId);
    //     if (!clan) {
    //       throw new AppError('Clan not found.', HTTP_STATUS.NOT_FOUND);
    //     }
    //     return clan;
    //   } catch (error) {
    //     console.error('Error in getClan service:', error);
    //     throw new AppError('An error occurred while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    //   }
    // }
    // Service to fetch clan details
    async getClan(clanId) {
        // Check if the clanId is valid
        if (!clanId) {
            throw new error_handler_1.AppError('Clan ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        try {
            // Fetch the clan from the repository
            const clan = await clanRepository_1.default.getClan(clanId);
            // Don't throw an error, just return null if clan not found
            if (!clan) {
                return null;
            }
            return clan;
        }
        catch (error) {
            console.error('Error in getClan service:', error);
            throw new error_handler_1.AppError('An error occurred while fetching the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Service to fetch all clans
    // async getAllClans(): Promise<ClanDTO[]> {
    //   try {
    //     // Fetch all clans from the repository
    //     const clans = await clanRepository.getAllClans();
    //     return clans;
    //   } catch (error) {
    //     console.error('Error in getAllClans service:', error);
    //     throw new AppError('An error occurred while fetching all clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    //   }
    // }
    async getAllClans() {
        try {
            // Fetch all clans from the repository
            const clans = await clanRepository_1.default.getAllClans();
            return clans;
        }
        catch (error) {
            console.error('Error in getAllClans service:', error);
            // Handle Sequelize errors
            if (error instanceof Error && error.name?.includes('Sequelize')) {
                throw new error_handler_1.AppError('Database error occurred while fetching clans.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            // Handle custom app errors
            if (error instanceof error_handler_1.AppError) {
                throw error;
            }
            // Handle any other errors
            throw new error_handler_1.AppError('An error occurred while fetching all clans.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // User joins a clan
    async joinClan(userId, clanId) {
        try {
            // Add user to ClanParticipants table and ClanLeaderBoardUsers table
            const result = await clanRepository_1.default.addUserToClan(userId, clanId);
            // If there's an error during the process, it will be thrown from the repository itself
            if (!result) {
                throw new error_handler_1.AppError('Failed to add the user to the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return { message: 'User successfully joined the clan!' };
        }
        catch (error) {
            console.error('Error in joinClan service:', error);
            // Re-throw AppError instances
            if (error instanceof error_handler_1.AppError) {
                throw error;
            }
            // Handle Sequelize errors
            if (error instanceof Error && error.name?.includes('Sequelize')) {
                throw new error_handler_1.AppError('Database error occurred while joining clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            // Handle any other errors
            throw new error_handler_1.AppError('An error occurred while trying to join the clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // User update a clan
    async updateClan(clanId, updateData) {
        if (!clanId) {
            throw new error_handler_1.AppError('Clan ID is required to update.', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        const existingClan = await clanRepository_1.default.getClan(clanId);
        if (!existingClan) {
            throw new error_handler_1.AppError('Clan not found.', http_status_1.HTTP_STATUS.NOT_FOUND);
        }
        const updatedClan = await clanRepository_1.default.updateClan(clanId, updateData);
        return updatedClan;
    }
    async deleteClan(clanId) {
        if (!clanId) {
            throw new error_handler_1.AppError('Clan ID is required.', http_status_1.HTTP_STATUS.BAD_REQUEST);
        }
        const existingClan = await clanRepository_1.default.getClan(clanId);
        if (!existingClan) {
            throw new error_handler_1.AppError('Clan not found.', http_status_1.HTTP_STATUS.NOT_FOUND);
        }
        await clanRepository_1.default.softDeleteClan(clanId); // 👈 soft delete
    }
}
exports.default = new ClanService();
//# sourceMappingURL=clanService.js.map