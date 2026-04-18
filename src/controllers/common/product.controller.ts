import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { PublicProductService } from "../../services/product/public.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const publicProductService = new PublicProductService();

export const listPublicProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await publicProductService.listProducts(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getPublicProduct = async (
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

    const result = await publicProductService.getProductDetail(slug);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
