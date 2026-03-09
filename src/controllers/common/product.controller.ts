import { NextFunction, Response } from "express";
import { listPublicProducts as listPublicProductsService } from "../../services/product/product.service";
import { CustomRequest } from "../../types/common";

export const listPublicProducts = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : undefined;

    const products = await listPublicProductsService(limit, cursor);

    const nextCursor =
      limit && products.length > 0 ? products[products.length - 1]?.id : null;

    res.status(200).json({
      success: true,
      data: {
        products,
        nextCursor,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};
