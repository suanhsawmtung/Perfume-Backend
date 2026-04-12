import { NextFunction, Response } from "express";
import { PublicBrandService } from "../../services/brand/public.service";
import { CustomRequest } from "../../types/common";

const publicBrandService = new PublicBrandService();

export const listPublicBrands = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await publicBrandService.listPublicBrands();

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
