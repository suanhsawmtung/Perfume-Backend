import { NextFunction, Response } from "express";
import { parseProductRatingQueryParams } from "../../services/product-rating/product-rating.helpers";
import * as ProductRatingService from "../../services/product-rating/product-rating.service";
import { CustomRequest } from "../../types/common";

export const listProductRatings = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pageSize, offset, search, product, user } =
      parseProductRatingQueryParams(req.query);

    const {
      items: productRatings,
      currentPage,
      totalPages,
      pageSize: actualPageSize,
    } = await ProductRatingService.listProductRatings({
      pageSize,
      offset,
      search,
      productSlug: product,
      username: user,
    });

    res.status(200).json({
      success: true,
      data: {
        productRatings,
        currentPage,
        totalPages,
        pageSize: actualPageSize,
      },
      message: null,
    });
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
    const { pageSize, offset, search, product } = parseProductRatingQueryParams(
      req.query
    );

    const {
      items: summaries,
      currentPage,
      totalPages,
      pageSize: actualPageSize,
    } = await ProductRatingService.listProductRatingSummary({
      pageSize,
      offset,
      search,
      productSlug: product,
    });

    res.status(200).json({
      success: true,
      data: {
        summaries,
        currentPage,
        totalPages,
        pageSize: actualPageSize,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};
