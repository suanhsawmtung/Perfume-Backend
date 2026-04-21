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

export const selectOptionListCategories = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;
    const search = req.query.search as string | undefined;

    const result = await publicCategoryService.selectOptionListCategories({ limit, cursor, search });

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
