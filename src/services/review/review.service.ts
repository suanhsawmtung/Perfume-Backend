import { Review } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { CursorPaginationParams, CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import { CreateReviewParams, MyReviewT, ProductReviewT } from "../../types/review";
import { createError } from "../../utils/common";
import { IReviewService } from "./review.interface";

export class ReviewService implements IReviewService {
  async listProductReviews(productSlug: string): Promise<ServiceResponseT<ProductReviewT[]>> {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true }
    });

    if (!product) {
      return {
        success: false,
        data: [],
        message: "Product not found"
      };
    }

    const reviews = await prisma.review.findMany({
      where: {
        productId: product.id,
        isPublish: true
      },
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
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      data: reviews as ProductReviewT[],
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

  async listMyReviews(userId: number, params: CursorPaginationParams): Promise<ServiceResponseT<CursorPaginationResultT<MyReviewT>>> {
    const limit = Number(params.limit) || 10;
    const cursor = params.cursor ? Number(params.cursor) : undefined;

    const reviews = await prisma.review.findMany({
      where: { userId, content: { not: null } },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
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
    });

    let nextCursor: number | null = null;
    if (reviews.length > limit) {
      const nextItem = reviews.pop();
      nextCursor = nextItem!.id;
    }

    return {
      success: true,
      data: {
        items: reviews as MyReviewT[],
        nextCursor
      },
      message: null
    };
  }

  async upsertReview(params: CreateReviewParams): Promise<ServiceResponseT<Review>> {
    return await prisma.$transaction(async (tx) => {
      // 1. Check if an existing review exists to determine if we are creating or updating
      const existingReview = await tx.review.findUnique({
        where: {
          userId_productId: {
            userId: params.userId,
            productId: params.productId,
          },
        },
      });

      // 2. Fetch the product to get current rating stats
      const product = await tx.product.findUnique({
        where: { id: params.productId },
        select: { rating: true, ratingCount: true },
      });

      if (!product) {
        throw createError({
          message: "Product not found",
          status: 404,
          code: errorCode.notFound,
        });
      }

      const oldAvg = Number(product.rating);
      const oldCount = product.ratingCount;

      // 3. Perform the upsert
      const review = await tx.review.upsert({
        where: {
          userId_productId: {
            userId: params.userId,
            productId: params.productId,
          },
        },
        update: {
          rating: params.rating,
          content: params.content ?? null,
          isPublish: false,
        },
        create: {
          userId: params.userId,
          productId: params.productId,
          rating: params.rating,
          content: params.content ?? null,
          isPublish: false,
        },
      });

      // 4. Recalculate rating and count
      let newAvg: number;
      let newCount: number;

      if (existingReview) {
        // Updating an existing review
        const oldRating = existingReview.rating;
        newCount = oldCount;
        newAvg = (oldAvg * oldCount - oldRating + params.rating) / oldCount;
      } else {
        // Creating a new review
        newCount = oldCount + 1;
        newAvg = (oldAvg * oldCount + params.rating) / newCount;
      }

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
        message: "Review submitted successfully",
      };
    });
  }
}
