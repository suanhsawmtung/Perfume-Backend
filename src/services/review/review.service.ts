import { errorCode } from "../../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ListReviewsParams } from "../../types/review";
import { createError } from "../../utils/common";
import { buildReviewWhere, findReviewDetail, updateReviewRecord } from "./review.helpers";

export const listReviews = async (params: ListReviewsParams) => {
  const { pageSize, offset, ...filters } = params;

  const where = await buildReviewWhere(filters);

  const total = await prisma.review.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const items = await prisma.review.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getReviewDetail = async (id: number) => {
  const review = await findReviewDetail(id);

  if (!review) {
    throw createError({
      message: "Review not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return review;
};

export const togglePublishing = async (id: number) => {
  const existing = await findReviewDetail(id);

  if (!existing) {
    throw createError({
      message: "Review not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return await updateReviewRecord(id, { isPublish: !existing.isPublish });
};
