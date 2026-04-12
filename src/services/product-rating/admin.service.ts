import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  ListProductRatingResultT,
  ListProductRatingSummaryResultT,
  ListProductRatingsParams,
  ListProductRatingT,
} from "../../types/product-rating";
import {
  buildProductRatingSummaryWhere,
  buildProductRatingWhere,
  parseProductRatingQueryParams
} from "./product-rating.helpers";
import { IAdminRatingService } from "./product-rating.interface";

export class AdminRatingService implements IAdminRatingService {
  async listRatings(
    params: ListProductRatingsParams
  ): Promise<ServiceResponseT<ListProductRatingResultT>> {
    const { pageSize, offset, search, product, user } =
      parseProductRatingQueryParams(params);

    const where = await buildProductRatingWhere({
      search,
      product,
      user,
    });

    const [items, total] = await Promise.all([
      prisma.productRating.findMany({
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
              brand: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.productRating.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as ListProductRatingT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async listProductRatingSummary(
    params: ListProductRatingsParams
  ): Promise<ServiceResponseT<ListProductRatingSummaryResultT>> {
    const { pageSize, offset, search, product } = parseProductRatingQueryParams(
      params
    );

    const where = await buildProductRatingSummaryWhere({
      search,
      productSlug: product,
    });

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items.map((item) => ({
          ...item,
          rating: Number(item.rating),
        })),
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }
}
