import { prisma } from "../../lib/prisma";
import {
  ListProductRatingsParams,
  ListProductRatingSummaryParams,
} from "../../types/product-rating";
import {
  buildProductRatingSummaryWhere,
  buildProductRatingWhere,
} from "./product-rating.helpers";

export const listProductRatings = async (params: ListProductRatingsParams) => {
  const { pageSize, offset, search, productSlug, username } = params;

  const where = buildProductRatingWhere({ search, productSlug, username });

  const total = await prisma.productRating.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const items = await prisma.productRating.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: {
            select: {
              name: true,
            },
          },
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

export const listProductRatingSummary = async (
  params: ListProductRatingSummaryParams
) => {
  const { pageSize, offset, search, productSlug } = params;

  const where = buildProductRatingSummaryWhere({ search, productSlug });

  const total = await prisma.product.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  // We fetch products and their associated ratings to calculate summaries.
  // Alternatively, if the product model already has aggregated fields, we could use them.
  // The user request implies showing "product and its total rating".
  // Based on the schema provided, Product has 'rating' (Decimal) and 'ratingCount' (Int).
  
  const items = await prisma.product.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      ratingCount: true,
      brand: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    items: items.map((item) => ({
      ...item,
      rating: Number(item.rating), // Convert Decimal to Number for frontend
    })),
    currentPage,
    totalPages,
    pageSize,
  };
};
