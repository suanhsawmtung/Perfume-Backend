import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { WishlistService } from "../../services/wishlist/wishlist.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const wishlistService = new WishlistService();

export const listMyWishlist = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { cursor, limit, search } = req.query;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    const result = await wishlistService.listMyWishlist(userId, {
      cursor: cursor as string,
      limit: limit as string,
      search: search as string,
    });
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const addToWishlist = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { productId } = req.params;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    if (!productId) {
      throw createError({
        message: "Product ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await wishlistService.addToWishlist({
      userId,
      productId: Number(productId)
    });
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { productId } = req.params;

    if (!userId) {
      throw createError({
        message: "Unauthenticated",
        status: 401,
        code: errorCode.unauthenticated,
      });
    }

    if (!productId) {
      throw createError({
        message: "Product ID is required",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await wishlistService.removeFromWishlist({
      userId,
      productId: Number(productId)
    });
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
