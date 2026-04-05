import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import * as UserService from "../../services/user/public.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

export const listPublicUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;

    const users = await UserService.listPublicUsers(limit, cursor);

    const nextCursor =
      limit && users.length > 0 ? users[users.length - 1]?.id : null;

    res.status(200).json({
      success: true,
      data: {
        users,
        nextCursor,
      },
      message: null,
    });
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
    const userId = req.userId;

    if (!userId) {
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });

      return next(error);
    }

    const user = await UserService.getMe(userId);

    res.status(200).json({
      success: true,
      data: user,
      message: "Fetched profile successfully.",
    });
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
    const userId = req.userId;

    if (!userId) {
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });

      await cleanupUploadedFiles(req);

      return next(error);
    }

    const { firstName, lastName, phone } = req.body;
    const file = (req as any).file as Express.Multer.File | undefined;

    const user = await UserService.updateMe(userId, {
      firstName,
      lastName,
      phone,
      ...(file?.filename && { imageFilename: file.filename }),
    });

    (req as any).uploadedFiles = [];

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully.",
    });
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
    const userId = req.userId;

    if (!userId) {
      const error = createError({
        message: "You are not an authenticated user.",
        status: 401,
        code: errorCode.unauthenticated,
      });

      return next(error);
    }

    const { oldPassword, newPassword } = req.body;

    await UserService.changePassword(userId, {
      oldPassword,
      newPassword,
    });

    res.status(200).json({
      success: true,
      data: null,
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
