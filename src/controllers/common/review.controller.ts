import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { ReviewService } from "../../services/review/review.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const reviewService = new ReviewService();

export const listProductReviews = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      throw createError({
        message: "Product slug is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.listProductReviews(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getReviewDetail = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw createError({
        message: "Review ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.getReviewDetail(Number(id));
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const listMyReviews = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { cursor, limit } = req.query;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const result = await reviewService.listMyReviews(userId, {
      cursor: cursor as string,
      limit: limit as string,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const upsertReview = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { productId, rating, content } = req.body;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    if (!productId || rating === undefined) {
      throw createError({
        message: "Product ID and rating are required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.upsertReview({
      userId,
      productId: Number(productId),
      rating: Number(rating),
      content,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};