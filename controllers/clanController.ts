import { Request, Response, NextFunction } from 'express';
import clanService from '../services/clanService';
import { ClanDTO, UpdateClanRequest } from '../types/clans';
import { catchAsync } from '../utils/error-handler';
import { HTTP_STATUS } from '../constants/http-status';
import { AppError } from '../utils/error-handler';

export const Create_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const clanPayload: ClanDTO = req.body;

  const createdClan = await clanService.createClan(clanPayload);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: createdClan,
  });
});

// Controller to fetch clan details
// export const Get_Single_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { clanId } = req.params;

//   // Check if the clanId is provided
//   if (!clanId) {
//     return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
//   }

//   try {
//     const clan = await clanService.getClan(clanId);

//     // If no clan is found, return an error
//     if (!clan) {
//       return next(new AppError('Clan not found.', HTTP_STATUS.NOT_FOUND));
//     }

//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       data: clan,
//     });
//   } catch (error) {
//     // Handle different types of errors

//     if (error instanceof AppError) {
//       return next(error);
//     }

//     console.error('Error in getClan controller:', error);
//     return next(new AppError('Something went wrong while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// });

// Controller to fetch clan details
// export const Get_Single_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { clanId } = req.params;

//     // Check if the clanId is provided
//     if (!clanId) {
//       return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
//     }

//     // Validate clanId format (assuming it's a UUID)
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//     if (!uuidRegex.test(clanId)) {
//       return next(new AppError('Invalid Clan ID format.', HTTP_STATUS.BAD_REQUEST));
//     }

//     const clan = await clanService.getClan(clanId);

//     // If no clan is found, return an error
//     if (!clan) {
//       return ({
//         success: false,
//         message: `Clan with ID ${clanId} not found.`,
//         data: null
//       });
//     }
//     else {
//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       message: "Clan retrieved successfully",
//       data: clan
//     });
//   }
  
//   } catch (error) {
//     // Handle different types of errors
//     console.error('Error in getClan controller:', error);

//     if (error instanceof AppError) {
//       return next(error);
//     }

//     // Handle Sequelize database errors specifically
//     if (error instanceof Error && error.name?.includes('Sequelize')) {
//       return next(new AppError('Database error while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//     }

//     return next(new AppError('Something went wrong while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// });

export const Get_Single_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clanId } = req.params;

    // Check if the clanId is provided
    if (!clanId) {
      return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
    }

    // Validate clanId format (assuming it's a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clanId)) {
      return next(new AppError('Invalid Clan ID format.', HTTP_STATUS.BAD_REQUEST));
    }

    const clan = await clanService.getClan(clanId);

    // If no clan is found, return a structured response with 404 status
    if (!clan) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Clan with ID ${clanId} not found.`,
        data: null
      });
    }

    // Return success response
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Clan retrieved successfully",
      data: clan
    });
  } catch (error) {
    // Handle different types of errors
    console.error('Error in getClan controller:', error);

    if (error instanceof AppError) {
      return next(error);
    }

    // Handle Sequelize database errors specifically
    if (error instanceof Error && error.name?.includes('Sequelize')) {
      return next(new AppError('Database error while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }

    return next(new AppError('Something went wrong while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// Controller to fetch all clans
export const Get_All_Clans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clans = await clanService.getAllClans();

     // If no clans are found, return an empty array (this is not an error)
    if (!clans || clans.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "No clans found",
        data: [],
        count: 0
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: clans,
      count: clans.length
    });
    } catch (error) {
    // Handle different types of errors
    console.error('Error in getAllClans controller:', error);

    if (error instanceof AppError) {
      return next(error);
    }

    // Handle Sequelize database errors specifically
    if (error instanceof Error && error.name?.includes('Sequelize')) {
      return next(new AppError('Database error while fetching clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }

    return next(new AppError('Something went wrong while fetching the clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// User joins the clan
// export const Join_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const { userId, clanId } = req.body;

//   // Validate required parameters
//   if (!userId || !clanId) {
//     return next(new AppError('Both userId and clanId are required.', HTTP_STATUS.BAD_REQUEST));
//   }

//   try {
//     // Call service method to handle business logic
//     const result = await clanService.joinClan(userId, clanId);

//     res.status(HTTP_STATUS.OK).json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     // Handle specific error cases
//     if (error instanceof AppError) {
//       return next(error);
//     }

//     console.error('Error in joinClan controller:', error);
//     return next(new AppError('Failed to join clan. Please try again later.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
//   }
// });

// User joins the clan
export const Join_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, clanId } = req.body;

    // Validate required parameters
    if (!userId) {
      return next(new AppError('User ID is required.', HTTP_STATUS.BAD_REQUEST));
    }

    if (!clanId) {
      return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
    }

    // Validate userId format (assuming it's a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return next(new AppError('Invalid User ID format.', HTTP_STATUS.BAD_REQUEST));
    }

    // Validate clanId format (assuming it's a UUID)
    if (!uuidRegex.test(clanId)) {
      return next(new AppError('Invalid Clan ID format.', HTTP_STATUS.BAD_REQUEST));
    }

    // Call service method to handle business logic
    const result = await clanService.joinClan(userId, clanId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "User successfully joined the clan",
      data: result
    });
  } catch (error) {
    // Handle specific error cases
    console.error('Error in joinClan controller:', error);

    if (error instanceof AppError) {
      // Specific error handling for the time restriction
      if (error.message.includes('Cannot join a new clan within 1 month')) {
        return next(new AppError(error.message, HTTP_STATUS.BAD_REQUEST));
      }
      return next(error);
    }

    // Handle Sequelize database errors specifically
    if (error instanceof Error && error.name?.includes('Sequelize')) {
      return next(new AppError('Database error while joining the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }

    return next(new AppError('Failed to join clan. Please try again later.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// User update the clan
export const Update_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { clanId } = req.params;
  const updateData: UpdateClanRequest = req.body;
  
  const updatedClan = await clanService.updateClan(clanId, updateData);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedClan,
  });
});

export const Delete_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { clanId } = req.params;

  await clanService.deleteClan(clanId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Clan successfully deleted (status set to false).',
  });
});
