"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Clans_1 = require("../models/Clans");
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const clanLeaderBoard_1 = __importDefault(require("../models/clanLeaderBoard"));
const clanParticipant_1 = __importDefault(require("../models/clanParticipant"));
const clanLeaderBoardUser_1 = __importDefault(require("../models/clanLeaderBoardUser"));
const User_1 = __importDefault(require("../models/User"));
class ClanRepository {
    async createClan(clanData) {
        try {
            const clan = await Clans_1.Clan.create({
                banner: clanData.banner,
                title: clanData.title,
                description: clanData.description,
                clanScore: clanData.clanScore || 0,
                status: true,
            });
            await clanLeaderBoard_1.default.create({
                clanId: clan.clanId, // Pass it inside an object
            });
            return clan.toJSON();
        }
        catch (error) {
            console.error('Error in createClan:', error);
            throw error;
        }
    }
    // Repository to fetch clan by its ID
    async getClan(clanId) {
        try {
            // Query the database for the clan by ID
            const clan = await Clans_1.Clan.findOne({
                where: { clanId },
                attributes: ['clanId', 'banner', 'title', 'description', 'clanScore', 'status', 'createdAt', 'updatedAt'], // Adjust based on your table structure
            });
            if (!clan) {
                return null; // If the clan doesn't exist, return null
            }
            return clan.toJSON(); // Return the clan as a DTO
        }
        catch (error) {
            console.error('Error in getClan repository:', error);
            throw new error_handler_1.AppError('Database error while fetching clan.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Repository to fetch all clans
    async getAllClans() {
        try {
            const clans = await Clans_1.Clan.findAll({
                where: { status: true }, // Only fetch clans where status is true
            });
            return clans.map(clan => clan.toJSON());
        }
        catch (error) {
            console.error('Error in getAllClans repository:', error);
            throw new error_handler_1.AppError('Database error while fetching all clans.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // Repository Method to Add User to Clan and LeaderBoard
    // Updated addUserToClan method to ensure the userName is populated from the Users table
    async addUserToClan(userId, clanId) {
        try {
            // Check if the user is already a participant in the clan
            if (!userId || !clanId) {
                throw new error_handler_1.AppError('User ID and Clan ID are required.', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            const existingParticipant = await clanParticipant_1.default.findOne({
                where: { userId, clanId },
            });
            if (existingParticipant) {
                throw new error_handler_1.AppError('User is already a participant in this clan.', http_status_1.HTTP_STATUS.BAD_REQUEST);
            }
            // Retrieve the LeaderBoardId for the given clanId
            const clanLeaderBoard = await clanLeaderBoard_1.default.findOne({
                where: { clanId },
            });
            if (!clanLeaderBoard) {
                throw new error_handler_1.AppError('Clan not found.', http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            const leaderBoardId = clanLeaderBoard.leaderBoardId; // Get the leaderBoardId
            // Fetch the user's name from the users table
            const user = await User_1.default.findOne({
                where: { userId },
                attributes: ['web3UserName'], // Only retrieve the userName field
            });
            if (!user) {
                throw new error_handler_1.AppError('User not found.', http_status_1.HTTP_STATUS.NOT_FOUND);
            }
            // check if user has any active clan and what is the date of joinings
            if (user.activeClanId && user.clanJoinDate) {
                // Calculate if the join date is older than a month
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                // If join date is NOT older than a month, throw error
                if (new Date(user.clanJoinDate) > oneMonthAgo) {
                    throw new error_handler_1.AppError(`User joined clan ${user.activeClanId} on ${user.clanJoinDate}. Cannot join a new clan within 1 month of joining.`, http_status_1.HTTP_STATUS.BAD_REQUEST);
                }
                // If join date is older than a month, allow joining new clan (proceed without error)
            }
            // update the activeClanId in the Users table
            await User_1.default.update({ activeClanId: clanId, clanJoinDate: new Date() }, // Set the activeClanId and clanJoinDate
            { where: { userId } } // Specify the condition to update the correct user
            );
            // Add the user to the ClanParticipants table
            await clanParticipant_1.default.create({
                userId,
                clanId,
            });
            // Add the user to the ClanLeaderBoardUser table with default ranking, points, and userName
            await clanLeaderBoardUser_1.default.create({
                userId,
                leaderBoardId, // Use the retrieved leaderBoardId
                userName: user.web3UserName, // Populate userName from the Users table
                ranking: 0, // Default ranking
                points: 0, // Default points
            });
            // await User.update(
            //   { 
            //     activeClanId: clanId,        // Set the user's activeClanId to the current clan
            //     clanJoinDate: new Date()      // Set the current date as the join date
            //   },
            //   {
            //     where: { userId }             // Target the user by userId
            //   }
            // );
            return { message: 'User successfully added to the clan and leaderboard!' };
        }
        catch (error) {
            console.error('Error in addUserToClan:', error);
            if (error instanceof error_handler_1.AppError) {
                throw error; // rethrow custom app errors
            }
            throw new error_handler_1.AppError('Error while adding user to the clan and leaderboard.', http_status_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    // update the clan
    async updateClan(clanId, updateData) {
        try {
            const [affectedRows, [updatedClan]] = await Clans_1.Clan.update({
                banner: updateData.banner,
                title: updateData.title,
                description: updateData.description,
                clanScore: updateData.clanScore,
            }, {
                where: { clanId },
                returning: true, // get the updated object
            });
            if (affectedRows === 0) {
                throw new Error('No clan updated.');
            }
            return updatedClan.toJSON();
        }
        catch (error) {
            console.error('Error in updateClan repository:', error);
            throw error;
        }
    }
    // deleting the clan
    async softDeleteClan(clanId) {
        try {
            const [affectedRows] = await Clans_1.Clan.update({ status: false }, // 👈 just set status to false
            { where: { clanId } });
            if (affectedRows === 0) {
                throw new Error('Clan not found or already deleted.');
            }
        }
        catch (error) {
            console.error('Error in softDeleteClan repository:', error);
            throw error;
        }
    }
}
exports.default = new ClanRepository();
//# sourceMappingURL=clanRepository.js.map