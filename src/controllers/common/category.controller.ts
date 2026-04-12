import { NextFunction, Response } from "express";
import { PublicCategoryService } from "../../services/category/public.service";
import { CustomRequest } from "../../types/common";

const publicCategoryService = new PublicCategoryService();

export const listPublicCategories = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await publicCategoryService.listPublicCategories();
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
