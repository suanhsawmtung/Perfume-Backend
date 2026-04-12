import { Review } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  ListReviewResultT,
  ListReviewsParams,
  ListReviewT,
} from "../../types/review";
import { createError } from "../../utils/common";
import {
  buildReviewWhere,
  findReviewDetail,
  parseReviewQueryParams,
  updateReviewRecord
} from "./review.helpers";
import { IAdminReviewService } from "./review.interface";

export class AdminReviewService implements IAdminReviewService {
  async listReviews(
    params: ListReviewsParams
  ): Promise<ServiceResponseT<ListReviewResultT>> {
    const { pageSize, offset, search, isPublish, username, productSlug } =
      parseReviewQueryParams(params);

    const where = await buildReviewWhere({
      search,
      isPublish,
      username,
      productSlug,
    });

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              username: true,
            },
          },
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as ListReviewT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getReviewDetail(id: number): Promise<ServiceResponseT<ListReviewT>> {
    const review = await findReviewDetail(id);

    if (!review) {
      throw createError({
        message: "Review not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: review as ListReviewT,
      message: null,
    };
  }

  async togglePublishing(
    id: number
  ): Promise<ServiceResponseT<Review>> {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw createError({
        message: "Review not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const updated = await updateReviewRecord(id, { isPublish: !review.isPublish });

    return {
      success: true,
      data: updated,
      message: `Review ${updated.isPublish ? "published" : "unpublished"} successfully.`,
    };
  }
}
