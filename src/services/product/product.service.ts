import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ProductDto } from "../../dtos/product.dto";
import { CursorPaginationResultT, SelectOptionT, ServiceResponseT } from "../../types/common";
import { ListProductResultT, ListProductsParams, ProductDetailT } from "../../types/product";
import { createError } from "../../utils/common";
import {
  buildProductWhere,
  findProductDetail,
  getProductCardSelect,
  parseProductQueryParams,
  requireSlug,
} from "./product.helpers";
import { IProductService } from "./product.interface";
import { Prisma } from "@prisma/client";

export class ProductService implements IProductService {
  async listProducts(
    params: ListProductsParams
  ): Promise<ServiceResponseT<ListProductResultT>> {
    const {
      pageSize,
      offset,
      search,
      brandSlug,
      gender,
      concentration,
      isLimited,
    } = parseProductQueryParams(params);

    // Public products must be active and have at least one primary variant
    const where = {
      ...buildProductWhere({
        search,
        brandSlug,
        gender,
        concentration,
        isActive: true,
        isLimited,
      }),
      variants: {
        some: {
          isPrimary: true,
          isActive: true,
          deletedAt: null,
        },
      },
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        select: getProductCardSelect(),
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items.map(ProductDto.toProductCard),
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getProductDetail(
    slug: string,
    userId?: string | number
  ): Promise<ServiceResponseT<ProductDetailT>> {
    const normalizedSlug = requireSlug(slug);

    // Using findProductDetail which already includes variants and images
    const product = await findProductDetail(normalizedSlug, userId);

    if (!product) {
      throw createError({
        message: "Product not found or unavailable.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    // Filter to only active variants for public view
    product.variants = product.variants.filter(v => v.isActive && !v.deletedAt);

    return {
      success: true,
      data: product,
      message: null,
    };
  }

  async selectOptionListProducts(
    query: { limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<CursorPaginationResultT<SelectOptionT>>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    }

    const [items, totalCount] = await Promise.all([
      prisma.product.findMany({
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        where,
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    let nextCursor: number | null = null;

    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      data: {
        items: items,
        nextCursor,
        totalCount
      },
      success: true,
      message: null,
    };
  }

  async selectOptionListProductVariants(
    query: { productSlug: string; limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<CursorPaginationResultT<SelectOptionT>>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;
    const slug = query.productSlug;

    const where: Prisma.ProductVariantWhereInput = {
      isActive: true,
      deletedAt: null,
      product: {
        slug: slug,
      },
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    }

    const [items, totalCount] = await Promise.all([
      prisma.productVariant.findMany({
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor } }),
        skip: cursor ? 1 : 0,
        where,
        select: {
          id: true,
          size: true,
          slug: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.productVariant.count({ where }),
    ]);

    let nextCursor: number | null = null;

    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      data: {
        items: items.map((item) => ({
          id: item.id,
          name: `${item.size} ml`,
          slug: item.slug,
        })),
        nextCursor,
        totalCount,
      },
      success: true,
      message: null,
    };
  }
}
