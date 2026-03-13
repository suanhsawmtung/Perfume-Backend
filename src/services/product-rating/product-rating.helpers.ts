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

export const buildProductRatingWhere = (params: {
  search?: string | undefined;
  productSlug?: string | undefined;
  username?: string | undefined;
}): Prisma.ProductRatingWhereInput => {
  const { search, productSlug, username } = params;
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

  if (productSlug) {
    whereConditions.push({
      product: {
        slug: { equals: productSlug, mode: "insensitive" },
      },
    });
  }

  if (username) {
    whereConditions.push({
      user: {
        username: { equals: username, mode: "insensitive" },
      },
    });
  }

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const buildProductRatingSummaryWhere = (params: {
  search?: string | undefined;
  productSlug?: string | undefined;
}): Prisma.ProductWhereInput => {
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
