import { NextFunction, Response } from "express";
import { ProfileService } from "../../services/user/profile.service";
import { PublicUserService } from "../../services/user/public.service";
import { CustomRequest } from "../../types/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

const profileService = new ProfileService();
const publicUserService = new PublicUserService();

export const listPublicUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

    const result = await publicUserService.listPublicUsers(limit, offset);

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getMe = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const result = await profileService.getMe(userId);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateMe = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const { firstName, lastName, phone } = req.body;
    const file = (req as any).file as Express.Multer.File | undefined;

    const result = await profileService.updateMe(userId, {
      firstName,
      lastName,
      phone,
      ...(file?.filename && { imageFilename: file.filename }),
    });

    (req as any).uploadedFiles = [];
    return res.status(200).json(result);
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const changePassword = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.userId);
    const { oldPassword, newPassword } = req.body;

    const result = await profileService.changePassword(userId, {
      oldPassword,
      newPassword,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
