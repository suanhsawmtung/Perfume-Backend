import { Prisma, Review } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CursorPaginationParams, CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import { CreateReviewParams, ListReviewsParams, ProductReviewT, ReviewCardT, UpdateReviewParams } from "../../types/review";
import { createError } from "../../utils/common";
import { IReviewService } from "./review.interface";
import { ReviewDto } from "../../dtos/review.dto";
import { parseReviewQueryParams } from "./review.helpers";
import { cleanHtmlPlain } from "../../lib/sanitize-html";

export class ReviewService implements IReviewService {
  async listProductReviews(
    productId: number,
    params: CursorPaginationParams
  ): Promise<ServiceResponseT<CursorPaginationResultT<ProductReviewT>>> {
    const { pageSize, cursor } = parseReviewQueryParams(params);

    const where: Prisma.ReviewWhereInput = {
      productId,
      isPublish: true,
      content: {
        not: null
      }
    };

    const [items, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
              image: true,
              emailVerifiedAt: true
            }
          }
        },
        orderBy: { createdAt: "desc" } // Using ID for monotonic cursor behavior
      }),
      prisma.review.count({ where })
    ]);

    let nextCursor: number | null = null;
    if (items.length > pageSize) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      success: true,
      data: {
        items,
        nextCursor,
        totalCount
      },
      message: null
    };
  }

  async getReviewDetail(id: number): Promise<ServiceResponseT<ProductReviewT>> {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            image: true,
          }
        },
      }
    });

    if (!review) {
      throw createError({
        message: "Review not found",
        status: 404,
        code: errorCode.notFound
      });
    }

    return {
      success: true,
      data: review as ProductReviewT,
      message: null
    };
  }

  async listMyReviews(userId: number, params: ListReviewsParams): Promise<ServiceResponseT<CursorPaginationResultT<ReviewCardT>>> {
    const { pageSize, cursor, search, isPublish } = parseReviewQueryParams(params);

    const where: Prisma.ReviewWhereInput = {
      userId,
      ...(isPublish !== undefined && { isPublish }),
      ...(search && {
        OR: [
          { content: { contains: search, mode: "insensitive" } },
          { product: { name: { contains: search, mode: "insensitive" } } },
          { product: { brand: { name: { contains: search, mode: "insensitive" } } } },
          { product: { variants: { some: { sku: { contains: search, mode: "insensitive" } } } } },
        ],
      })
    }

    const [items, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        take: pageSize + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              brand: {
                select: {
                  name: true,
                }
              },
              variants: {
                where: {
                  isPrimary: true,
                },
                take: 1,
                select: {
                  images: {
                    take: 1,
                    where: {
                      isPrimary: true,
                    },
                    select: { path: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" } // Using ID for monotonic cursor behavior
      }),
      prisma.review.count({ where })
    ]);

    let nextCursor: number | null = null;
    if (items.length > pageSize) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      success: true,
      data: {
        items: items.map(ReviewDto.toReviewCard),
        nextCursor,
        totalCount
      },
      message: null
    };
  }

  async createReview(params: CreateReviewParams): Promise<ServiceResponseT<Review>> {
    // 1. Check if an existing review exists for the given user and product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: params.userId,
          productId: params.productId,
        },
      },
    });

    if (existingReview) {
      throw createError({
        message: "You have already reviewed this product",
        status: 400,
        code: errorCode.notAllowed,
      });
    }

    // 2. Fetch the product to get current rating stats
    const product = await prisma.product.findUnique({
      where: { id: params.productId, deletedAt: null, isActive: true },
      select: { rating: true, ratingCount: true },
    });

    if (!product) {
      throw createError({
        message: "Product not found",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return await prisma.$transaction(async (tx) => {
      const oldAvg = Number(product.rating);
      const oldCount = product.ratingCount;

      // 3. Create the review
      const review = await tx.review.create({
        data: {
          userId: params.userId,
          productId: params.productId,
          rating: params.rating,
          content: params.content ? cleanHtmlPlain(params.content) : null,
          isPublish: false,
        },
      });

      // 4. Recalculate rating and count
      const newCount = oldCount + 1;
      const newAvg = (oldAvg * oldCount + params.rating) / newCount;

      // 5. Update the product with new aggregates
      await tx.product.update({
        where: { id: params.productId },
        data: {
          rating: newAvg,
          ratingCount: newCount,
        },
      });

      return {
        success: true,
        data: review,
        message: "Review created successfully",
      };
    });
  }

  async updateReview(id: number, userId: number, productId: number, params: UpdateReviewParams): Promise<ServiceResponseT<Review>> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { rating: true, ratingCount: true },
    });

    if (!product) {
      throw createError({
        message: "Product not found",
        status: 404,
        code: errorCode.notFound,
      });
    }

    // 1. Find the existing review
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw createError({
        message: "Review not found",
        status: 404,
        code: errorCode.notFound,
      });
    }

    // 2. Check ownership
    if (existingReview.userId !== userId) {
      throw createError({
        message: "You are not authorized to update this review",
        status: 403,
        code: errorCode.notAllowed,
      });
    }

    // Ensure the review belongs to the product we're checking
    if (existingReview.productId !== productId) {
      throw createError({
        message: "You are not authorized to update this review",
        status: 403,
        code: errorCode.notAllowed,
      });
    }

    // 3. Check published status
    if (existingReview.isPublish) {
      throw createError({
        message: "You can't edit published review",
        status: 400,
        code: errorCode.notAllowed,
      });
    }

    return await prisma.$transaction(async (tx) => {

      // 4. If rating is changing, recalculate the product rating
      if (params.rating !== existingReview.rating) {
        const oldAvg = Number(product.rating);
        const oldCount = product.ratingCount;

        // Recalculate average (count remains the same since it's an update)
        const newAvg = (oldAvg * oldCount - existingReview.rating + params.rating) / oldCount;

        await tx.product.update({
          where: { id: existingReview.productId },
          data: {
            rating: newAvg,
          },
        });
      }

      // 5. Perform the update
      const review = await tx.review.update({
        where: { id },
        data: {
          rating: params.rating,
          content: params.content ? cleanHtmlPlain(params.content) : null,
        },
      });

      return {
        success: true,
        data: review,
        message: "Review updated successfully",
      };
    });
  }

  async deleteReview(id: number, userId: number): Promise<ServiceResponseT<null>> {
    // 1. Find the existing review
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw createError({
        message: "Review not found",
        status: 404,
        code: errorCode.notFound,
      });
    }

    // 2. Check ownership
    if (existingReview.userId !== userId) {
      throw createError({
        message: "You are not authorized to delete this review",
        status: 403,
        code: errorCode.notAllowed,
      });
    }

    // 3. Fetch the product to get current rating stats
    const product = await prisma.product.findUnique({
      where: { id: existingReview.productId },
      select: { rating: true, ratingCount: true },
    });

    return await prisma.$transaction(async (tx) => {
      // 4. Delete the review
      await tx.review.delete({
        where: { id },
      });

      if (product) {
        const oldAvg = Number(product.rating);
        const oldCount = product.ratingCount;

        // 5. Recalculate rating and count
        const newCount = oldCount - 1;
        const newAvg = newCount > 0 ? (oldAvg * oldCount - existingReview.rating) / newCount : 0;

        // 6. Update the product with new aggregates
        await tx.product.update({
          where: { id: existingReview.productId },
          data: {
            rating: newAvg,
            ratingCount: newCount,
          },
        });
      }

      return {
        success: true,
        data: null,
        message: "Review deleted successfully",
      };
    });
  }
}
