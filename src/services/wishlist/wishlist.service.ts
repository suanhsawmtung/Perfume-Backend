import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CursorPaginationParams, ServiceResponseT } from "../../types/common";
import { ListWishlistsParams, MyWishlistResultT, ToggleWishlistResponseT } from "../../types/wishlist";
import { createError } from "../../utils/common";
import { IWishlistService } from "./wishlist.interface";
import { WishlistDto } from "../../dtos/wishlist.dto";

export class WishlistService implements IWishlistService {
  async listMyWishlist(
    userId: number,
    params: ListWishlistsParams
  ): Promise<ServiceResponseT<MyWishlistResultT>> {
    const limit = Number(params.limit) || 10;
    const cursor = params.cursor ? Number(params.cursor) : undefined;
    const search = params.search;

    const where: Prisma.ProductWishlistWhereInput = {
      userId,
      product: {
        isActive: true,
        deletedAt: null,
        variants: {
          some: {
            isActive: true,
            deletedAt: null
          }
        }
      },
      ...(search ? {
        OR: [
          {
            product: {
              name: {
                contains: search,
                mode: "insensitive"
              },
            },
          },
          {
            product: {
              brand: {
                name: {
                  contains: search,
                  mode: "insensitive"
                },
              },
            },
          }
        ]
      } : {})
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
                where: { isPrimary: true, isActive: true, deletedAt: null },
                take: 1,
                select: {
                  id: true,
                  slug: true,
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
        items: items.map(WishlistDto.toWishlistCard),
        nextCursor,
        totalCount,
      },
      message: null,
    };
  }

  async addToWishlist({ userId, productId }: {
    userId: number;
    productId: number;
  }): Promise<ServiceResponseT<ToggleWishlistResponseT>> {
    // 1. Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
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
      return {
        success: true,
        data: {
          isAdded: true,
          message: "Already in wishlist",
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

  async removeFromWishlist({ userId, productId }: {
    userId: number;
    productId: number;
  }): Promise<ServiceResponseT<ToggleWishlistResponseT>> {
    // 1. Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
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
      return {
        success: true,
        data: {
          isAdded: false,
          message: "Not in wishlist",
        },
        message: "Wishlist updated",
      };
    }
  }
}
