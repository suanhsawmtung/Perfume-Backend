import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { ParseProductRatingQueryParamsResult } from "../../types/product-rating";

export const parseProductRatingQueryParams = (
  query: any
): ParseProductRatingQueryParamsResult => {
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

  const product =
    typeof query.product === "string" && query.product.trim().length > 0
      ? query.product.trim()
      : undefined;

  const user =
    typeof query.user === "string" && query.user.trim().length > 0
      ? query.user.trim()
      : undefined;

  return {
    pageSize,
    offset,
    search,
    product,
    user,
  };
};

export const buildProductRatingWhere = async (params: {
  search?: string | undefined;
  product?: string | undefined;
  user?: string | undefined;
}): Promise<Prisma.ProductRatingWhereInput> => {
  const { search, product, user } = params;
  const whereConditions: Prisma.ProductRatingWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
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

  if (product) {
    whereConditions.push({
      product: {
        slug: { equals: product, mode: "insensitive" },
      },
    });
  }

  if (user) {
    whereConditions.push({
      user: {
        username: { equals: user, mode: "insensitive" },
      },
    });
  }

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const buildProductRatingSummaryWhere = async (params: {
  search?: string | undefined;
  productSlug?: string | undefined;
}): Promise<Prisma.ProductWhereInput> => {
  const { search, productSlug } = params;
  const whereConditions: Prisma.ProductWhereInput[] = [];

  if (search) {
    whereConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (productSlug) {
    whereConditions.push({
      slug: { equals: productSlug, mode: "insensitive" },
    });
  }

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const findProductRatingDetail = async (id: number) => {
  return await prisma.productRating.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
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

export const deleteProductRatingRecord = async (id: number) => {
  return await prisma.productRating.delete({
    where: { id },
  });
};
