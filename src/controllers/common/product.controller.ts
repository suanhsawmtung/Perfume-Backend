import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { ProductService } from "../../services/product/product.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const productService = new ProductService();

export const listProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await productService.listProducts(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getProduct = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { userId } = req;

    if (!slug) {
      throw createError({
        message: "Slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await productService.getProductDetail(slug, userId);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const selectOptionListProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;
    const search = req.query.search as string | undefined;

    const result = await productService.selectOptionListProducts({ limit, cursor, search });

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const selectOptionListProductVariants = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productSlug } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;
    const search = req.query.search as string | undefined;

    if(!productSlug) {
      throw createError({
        message: "Product slug parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await productService.selectOptionListProductVariants({ productSlug, limit, cursor, search });

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
