import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { PostService } from "../../services/post/post.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const postService = new PostService();

export const listPosts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await postService.listPosts(req.query);
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

    const result = await postService.getPostDetail(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};