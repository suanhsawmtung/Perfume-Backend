import { NextFunction, Response } from "express";
import { AdminRatingService } from "../../services/product-rating/admin.service";
import { CustomRequest } from "../../types/common";

const adminRatingService = new AdminRatingService();

export const listProductRatings = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminRatingService.listRatings(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const listProductRatingSummary = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminRatingService.listProductRatingSummary(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
