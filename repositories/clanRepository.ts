import { Clan } from '../models/Clans';
import { ClanDTO, UpdateClanRequest } from '../types/clans';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import ClanLeaderBoard from '../models/clanLeaderBoard';
import clanParticipant from '../models/clanParticipant';
import clanLeaderBoardUser from '../models/clanLeaderBoardUser';
import User from '../models/User';
class ClanRepository {
  async createClan(clanData: ClanDTO): Promise<ClanDTO> {
    try {
      const clan = await Clan.create({
        banner: clanData.banner,
        title: clanData.title,
        description: clanData.description,
        clanScore: clanData.clanScore || 0,
        status: true,
      });
      await ClanLeaderBoard.create({
        clanId: clan.clanId,  // Pass it inside an object
      });
      
      return clan.toJSON() as ClanDTO;
    } catch (error) {
      console.error('Error in createClan:', error);
      throw error;
    }
  }

  // Repository to fetch clan by its ID
  async getClan(clanId: string): Promise<ClanDTO | null> {
    try {
      // Query the database for the clan by ID
      const clan = await Clan.findOne({
        where: { clanId },
        attributes: ['clanId', 'banner', 'title', 'description', 'clanScore', 'status', 'createdAt', 'updatedAt'], // Adjust based on your table structure
      });

      if (!clan) {
        return null; // If the clan doesn't exist, return null
      }

      return clan.toJSON() as ClanDTO; // Return the clan as a DTO
    } catch (error) {
      console.error('Error in getClan repository:', error);
      throw new AppError('Database error while fetching clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
  // Repository to fetch all clans
  async getAllClans(): Promise<ClanDTO[]> {
    try {
      const clans = await Clan.findAll({
        where: { status: true }, // Only fetch clans where status is true
      });

      return clans.map(clan => clan.toJSON() as ClanDTO);
    } catch (error) {
      console.error('Error in getAllClans repository:', error);
      throw new AppError('Database error while fetching all clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

 // Repository Method to Add User to Clan and LeaderBoard
// Updated addUserToClan method to ensure the userName is populated from the Users table
async addUserToClan(userId: string, clanId: string): Promise<any> {
  try {
    // Check if the user is already a participant in the clan
    const existingParticipant = await clanParticipant.findOne({
      where: { userId, clanId },
    });

    if (existingParticipant) {
      throw new AppError('User is already a participant in this clan.', HTTP_STATUS.BAD_REQUEST);
    }

    // Retrieve the LeaderBoardId for the given clanId
    const clanLeaderBoard = await ClanLeaderBoard.findOne({
      where: { clanId },
    });

    if (!clanLeaderBoard) {
      throw new AppError('Clan does not have a corresponding leaderboard.', HTTP_STATUS.NOT_FOUND);
    }

    const leaderBoardId = clanLeaderBoard.leaderBoardId;  // Get the leaderBoardId

    // Fetch the user's name from the users table
    const user = await User.findOne({
      where: { userId },
      attributes: ['web3UserName'],  // Only retrieve the userName field
    });

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
    }

    // update the activeClanId in the Users table
    await User.update(
      { activeClanId: clanId, clanJoinDate: new Date() }, // Set the activeClanId and clanJoinDate
      { where: { userId } } // Specify the condition to update the correct user
    );

    // Add the user to the ClanParticipants table
    await clanParticipant.create({
      userId,
      clanId,
    });

    // Add the user to the ClanLeaderBoardUser table with default ranking, points, and userName
    await clanLeaderBoardUser.create({
      userId,
      leaderBoardId, // Use the retrieved leaderBoardId
      userName: user.web3UserName,  // Populate userName from the Users table
      ranking: 0,     // Default ranking
      points: 0,      // Default points
    });

    return { message: 'User successfully added to the clan and leaderboard!' };
  } catch (error) {
    console.error('Error in addUserToClan:', error);
    throw new AppError('Error while adding user to the clan and leaderboard.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

// update the clan
async updateClan(clanId: string, updateData: UpdateClanRequest) {
  try {
    const [affectedRows, [updatedClan]] = await Clan.update(
      { 
        banner: updateData.banner,
        title: updateData.title,
        description: updateData.description,
        clanScore: updateData.clanScore,
      },
      {
        where: { clanId},
        returning: true, // get the updated object
      }
    );

    if (affectedRows === 0) {
      throw new Error('No clan updated.');
    }

    return updatedClan.toJSON();
  } catch (error) {
    console.error('Error in updateClan repository:', error);
    throw error;
  }
}

// deleting the clan
async softDeleteClan(clanId: string) {
  try {
    const [affectedRows] = await Clan.update(
      { status: false },  // 👈 just set status to false
      { where: { clanId } }
    );

    if (affectedRows === 0) {
      throw new Error('Clan not found or already deleted.');
    }
  } catch (error) {
    console.error('Error in softDeleteClan repository:', error);
    throw error;
  }
}


}



export default new ClanRepository();
