import { NextFunction, Response } from "express";
import { BrandService } from "../../services/brand/brand.service";
import { CustomRequest } from "../../types/common";

const brandService = new BrandService();

export const listPublicBrands = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await brandService.listPublicBrands();

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const selectOptionListBrands = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;
    const search = req.query.search as string | undefined;

    const result = await brandService.selectOptionListBrands({ limit, cursor, search });

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
