import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { AdminPostService } from "../../services/post/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";
import { cleanupUploadedFiles } from "../../utils/file-cleanup";

const adminPostService = new AdminPostService();

export const listPosts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminPostService.listPosts({
      ...req.query,
      ...(req.userId && { authenticatedUserId: req.userId }),
    });
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminPostService.getPostDetail(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createPost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;

    const result = await adminPostService.createPost({
      ...req.body,
      imageFilename: file?.filename,
      authenticatedUserId: req.userId,
    });

    (req as any).uploadedFiles = [];

    return res.status(201).json(result);
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const updatePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const file = (req as any).file as Express.Multer.File | undefined;

    const result = await adminPostService.updatePost(slug, {
      ...req.body,
      imageFilename: file?.filename,
      authenticatedUserId: req.userId,
    });

    (req as any).uploadedFiles = [];

    return res.status(200).json(result);
  } catch (error: any) {
    await cleanupUploadedFiles(req);
    next(error);
  }
};

export const deletePost = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminPostService.deletePost(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
