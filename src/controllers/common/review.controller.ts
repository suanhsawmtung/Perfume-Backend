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
    const { productId } = req.params;

    if (!productId) {
      throw createError({
        message: "Product ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.listProductReviews(Number(productId), req.query);
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

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const result = await reviewService.listMyReviews(userId, req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createReview = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { productId } = req.params;
    const { rating, content } = req.body;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    if (!productId) {
      throw createError({
        message: "Product ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.createReview({
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

export const updateReview = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { productId, id } = req.params;
    const { rating, content } = req.body;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    if (!productId) {
      throw createError({
        message: "Product ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (!id) {
      throw createError({
        message: "Review ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.updateReview(Number(id), userId, Number(productId), {
      rating: Number(rating),
      content,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteReview = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { productId, id } = req.params;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    if (!productId) {
      throw createError({
        message: "Product ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    if (!id) {
      throw createError({
        message: "Review ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await reviewService.deleteReview(Number(id), userId);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};