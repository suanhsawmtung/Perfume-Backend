import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ParseCategoryQueryParamsResult } from "../../types/category";
import { createError } from "../../utils/common";

export const parseCategoryQueryParams = (
  query: any
): ParseCategoryQueryParamsResult => {
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

  return {
    pageSize,
    offset,
    search,
  };
};

export const requireSlug = (slug: string) => {
  if (!slug || slug.trim().length === 0) {
    throw createError({
      message: "Slug parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return slug.trim();
};

export const findCategoryByName = async (name: string) => {
  return await prisma.category.findFirst({
    where: { name },
  });
};

export const findCategoryByNameExcludingId = async (
  name: string,
  excludeId: number
) => {
  return await prisma.category.findFirst({
    where: {
      name,
      NOT: { id: excludeId },
    },
  });
};

export const findCategoryBySlug = async (slug: string) => {
  return await prisma.category.findUnique({
    where: { slug },
  });
};

export const findCategoryBySlugWithPostCount = async (slug: string) => {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
};

export const findCategoryById = async (id: number) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

export const createCategoryRecord = async (
  createCategoryData: Prisma.CategoryCreateInput
) => {
  return await prisma.category.create({
    data: createCategoryData,
  });
};

export const updateCategoryRecord = async (
  id: number,
  updateCategoryData: Prisma.CategoryUpdateInput
) => {
  return await prisma.category.update({
    where: { id },
    data: updateCategoryData,
  });
};

export const deleteCategoryRecord = async (id: number) => {
  return await prisma.category.delete({
    where: { id },
  });
};
