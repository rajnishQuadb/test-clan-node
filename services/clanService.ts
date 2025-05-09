import { ClanDTO,UpdateClanRequest } from '../types/clans';
import clanRepository from '../repositories/clanRepository';
import { AppError } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';

class ClanService {
  async createClan(clanData: ClanDTO): Promise<ClanDTO> {
    if (!clanData.title || !clanData.description || !clanData.banner) {
        throw new AppError('Missing required fields: title, description, and banner are required.', HTTP_STATUS.BAD_REQUEST);
      }

    // You could add validation here for existing leaderboardId, etc.

    const createdClan = await clanRepository.createClan(clanData);
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
async getClan(clanId: string): Promise<ClanDTO | null> {
  // Check if the clanId is valid
  if (!clanId) {
    throw new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    // Fetch the clan from the repository
    const clan = await clanRepository.getClan(clanId);
    
    // Don't throw an error, just return null if clan not found
    if (!clan) {
      return null;
    }

    return clan;
  } catch (error) {
    console.error('Error in getClan service:', error);
    throw new AppError('An error occurred while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
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
  async getAllClans(): Promise<ClanDTO[]> {
  try {
    // Fetch all clans from the repository
    const clans = await clanRepository.getAllClans();
    
    return clans;
  } catch (error) {
    console.error('Error in getAllClans service:', error);
    
    // Handle Sequelize errors
    if (error instanceof Error && error.name?.includes('Sequelize')) {
      throw new AppError('Database error occurred while fetching clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    
    // Handle custom app errors
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle any other errors
    throw new AppError('An error occurred while fetching all clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

  // User joins a clan
  async joinClan(userId: string, clanId: string): Promise<any> {
      try {
    // Add user to ClanParticipants table and ClanLeaderBoardUsers table
    const result = await clanRepository.addUserToClan(userId, clanId);
    
    // If there's an error during the process, it will be thrown from the repository itself
    if (!result) {
      throw new AppError('Failed to add the user to the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

        return { message: 'User successfully joined the clan!' };
        } catch (error) {
    console.error('Error in joinClan service:', error);
    
    // Re-throw AppError instances
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle Sequelize errors
    if (error instanceof Error && error.name?.includes('Sequelize')) {
      throw new AppError('Database error occurred while joining clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    
    // Handle any other errors
    throw new AppError('An error occurred while trying to join the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}


  // User update a clan
  async updateClan(clanId: string, updateData: UpdateClanRequest) {
    if (!clanId) {
      throw new AppError('Clan ID is required to update.', HTTP_STATUS.BAD_REQUEST);
    }

    const existingClan = await clanRepository.getClan(clanId);
    if (!existingClan) {
      throw new AppError('Clan not found.', HTTP_STATUS.NOT_FOUND);
    }

    const updatedClan = await clanRepository.updateClan(clanId, updateData);
    return updatedClan;
  }

  async deleteClan(clanId: string) {
    if (!clanId) {
      throw new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST);
    }

    const existingClan = await clanRepository.getClan(clanId);
    if (!existingClan) {
      throw new AppError('Clan not found.', HTTP_STATUS.NOT_FOUND);
    }

    await clanRepository.softDeleteClan(clanId); // 👈 soft delete
  }
}

export default new ClanService();
