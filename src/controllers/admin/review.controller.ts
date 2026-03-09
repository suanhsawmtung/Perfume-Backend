import { NextFunction, Response } from "express";
import { parseReviewQueryParams, requireReviewId } from "../../services/review/review.helpers";
import * as ReviewService from "../../services/review/review.service";
import { CustomRequest } from "../../types/common";

export const listReviews = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseReviewQueryParams(req.query);

    const {
      items: reviews,
      currentPage,
      totalPages,
      pageSize,
    } = await ReviewService.listReviews({
      ...queryParams,
      isPublish: queryParams.status === "publish" ? true : queryParams.status === "unpublish" ? false : undefined,
      username: queryParams.user,
      productSlug: queryParams.product,
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getReview = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = requireReviewId(Number(req.params.id));

    const review = await ReviewService.getReviewDetail(id);

    res.status(200).json({
      success: true,
      data: { review },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const togglePublishing = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = requireReviewId(Number(req.params.id));

    const review = await ReviewService.togglePublishing(id);

    res.status(200).json({
      success: true,
      data: { review },
      message: `Review ${review.isPublish ? "published" : "unpublished"} successfully.`,
    });
  } catch (error: any) {
    next(error);
  }
};
