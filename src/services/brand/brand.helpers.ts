import { Prisma } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ParseBrandQueryParamsResult } from "../../types/brand";
import { createError } from "../../utils/common";

export const parseBrandQueryParams = (
  query: any
): ParseBrandQueryParamsResult => {
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

export const buildBrandWhereClause = (params: {
  search?: string | undefined;
}): Prisma.BrandWhereInput => {
  const { search } = params;
  const where: Prisma.BrandWhereInput = {
    deletedAt: null,
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
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

export const findBrandByName = async (name: string) => {
  return await prisma.brand.findFirst({
    where: { name },
  });
};

export const findBrandByNameExcludingId = async (
  name: string,
  excludeId: number
) => {
  return await prisma.brand.findFirst({
    where: {
      name,
      NOT: { id: excludeId },
    },
  });
};

export const findBrandBySlug = async (slug: string) => {
  return await prisma.brand.findUnique({
    where: { slug },
  });
};

export const findBrandBySlugWithProductCount = async (slug: string) => {
  return await prisma.brand.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};

export const findBrandById = async (id: number) => {
  return await prisma.brand.findUnique({
    where: { id },
  });
};

export const createBrandRecord = async (
  createBrandData: Prisma.BrandCreateInput
) => {
  return await prisma.brand.create({
    data: createBrandData,
  });
};

export const updateBrandRecord = async (
  id: number,
  updateBrandData: Prisma.BrandUpdateInput
) => {
  return await prisma.brand.update({
    where: { id },
    data: updateBrandData,
  });
};

export const deleteBrandRecord = async (id: number) => {
  return await prisma.brand.delete({
    where: { id },
  });
};
