import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { BuildReviewWhereParams, ParseReviewQueryParamsResult } from "../../types/review";
import { createError } from "../../utils/common";

export const buildReviewWhere = async ({
  search,
  isPublish,
  username,
  productSlug,
}: BuildReviewWhereParams): Promise<Prisma.ReviewWhereInput> => {
  const whereConditions: Prisma.ReviewWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { content: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          product: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ],
    });
  }

  if (isPublish !== undefined) {
    whereConditions.push({ isPublish });
  }

  if (username) {
    whereConditions.push({
      user: {
        username: { equals: username, mode: "insensitive" },
      },
    });
  }

  if (productSlug) {
    whereConditions.push({
      product: {
        slug: { equals: productSlug, mode: "insensitive" },
      },
    });
  }

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const parseReviewQueryParams = (query: any): ParseReviewQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  let isPublish: boolean | undefined;
  if (query.status === "publish") {
    isPublish = true;
  } else if (query.status === "unpublish") {
    isPublish = false;
  }

  const username =
    typeof query.user === "string" && query.user.trim().length > 0
      ? query.user.trim()
      : undefined;

  const productSlug =
    typeof query.product === "string" && query.product.trim().length > 0
      ? query.product.trim()
      : undefined;

  return {
    pageSize,
    offset,
    search,
    isPublish,
    username,
    productSlug,
  };
};

export const findReviewDetail = async (id: number) => {
  return await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
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
};

export const updateReviewRecord = async (id: number, data: Prisma.ReviewUpdateInput) => {
  return await prisma.review.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
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
};

export const deleteReviewRecord = async (id: number) => {
  return await prisma.review.delete({
    where: { id },
  });
};

export const requireReviewId = (id: number) => {
  if (isNaN(id) || id <= 0) {
    throw createError({
      message: "Invalid review ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }
  return id;
};
