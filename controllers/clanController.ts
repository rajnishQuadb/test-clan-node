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
export const Get_Single_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { clanId } = req.params;

  // Check if the clanId is provided
  if (!clanId) {
    return next(new AppError('Clan ID is required.', HTTP_STATUS.BAD_REQUEST));
  }

  try {
    const clan = await clanService.getClan(clanId);

    // If no clan is found, return an error
    if (!clan) {
      return next(new AppError('Clan not found.', HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: clan,
    });
  } catch (error) {
    // Handle different types of errors

    if (error instanceof AppError) {
      return next(error);
    }

    console.error('Error in getClan controller:', error);
    return next(new AppError('Something went wrong while fetching the clan.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// Controller to fetch all clans
export const Get_All_Clans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clans = await clanService.getAllClans();

    // If no clans are found, return an empty array
    if (!clans || clans.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: [],
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: clans,
    });
  } catch (error) {
    // Handle different types of errors

    if (error instanceof AppError) {
      return next(error);
    }

    console.error('Error in getAllClans controller:', error);
    return next(new AppError('Something went wrong while fetching the clans.', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// User joins the clan
export const Join_Clan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, clanId } = req.body; // Assume these come in the request body
  
  // Call service method to handle business logic
  const result = await clanService.joinClan(userId, clanId);

  res.status(200).json({
    success: true,
    data: result, // Return success message or updated data
  });
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
