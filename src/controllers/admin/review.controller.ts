import { NextFunction, Response } from "express";
import { AdminReviewService } from "../../services/review/admin.service";
import { parseReviewQueryParams, requireReviewId } from "../../services/review/review.helpers";
import { CustomRequest } from "../../types/common";

const adminReviewService = new AdminReviewService();

export const listReviews = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const result = await adminReviewService.listReviews(req.query);

    return res.status(200).json(result);
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
    const result = await adminReviewService.getReviewDetail(id);
    return res.status(200).json(result);
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
    const result = await adminReviewService.togglePublishing(id);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
