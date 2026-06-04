import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CursorPaginationParams, ServiceResponseT } from "../../types/common";
import { MyWishlistResultT, ToggleWishlistResponseT, WishlistItemT } from "../../types/wishlist";
import { createError } from "../../utils/common";
import { IWishlistService } from "./wishlist.interface";

export class WishlistService implements IWishlistService {
  async listMyWishlist(
    userId: number,
    params: CursorPaginationParams
  ): Promise<ServiceResponseT<MyWishlistResultT>> {
    const limit = Number(params.limit) || 10;
    const cursor = params.cursor ? Number(params.cursor) : undefined;

    const where: Prisma.ProductWishlistWhereInput = {
      userId,
    }

    const [items, totalCount] = await Promise.all([
      prisma.productWishlist.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              brand: {
                select: { name: true },
              },
              variants: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  price: true,
                  discount: true,
                  stock: true,
                  reserved: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                    select: { path: true },
                  },
                }
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productWishlist.count({ where })
    ]);

    let nextCursor: number | null = null;
    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      success: true,
      data: {
        items: items as WishlistItemT[],
        nextCursor,
        totalCount,
      },
      message: null,
    };
  }

  async toggleWishlist(
    userId: number,
    productId: number
  ): Promise<ServiceResponseT<ToggleWishlistResponseT>> {
    // 1. Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw createError({
        message: "Product not found",
        status: 404,
        code: errorCode.notFound,
      });
    }

    // 2. Check if already in wishlist
    const existing = await prisma.productWishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove
      await prisma.productWishlist.delete({
        where: { id: existing.id },
      });

      return {
        success: true,
        data: {
          isAdded: false,
          message: "Removed from wishlist",
        },
        message: "Wishlist updated",
      };
    } else {
      // Add
      await prisma.productWishlist.create({
        data: {
          userId,
          productId,
        },
      });

      return {
        success: true,
        data: {
          isAdded: true,
          message: "Added to wishlist",
        },
        message: "Wishlist updated",
      };
    }
  }
}
