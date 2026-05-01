import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { ListProductResultT, ListProductsParams, ProductDetailT } from "../../types/product";
import { createError } from "../../utils/common";
import {
  buildProductWhere,
  findProductDetail,
  parseProductQueryParams,
  requireSlug,
} from "./product.helpers";
import { IProductService } from "./product.interface";

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

    // Public products must be active
    const where = buildProductWhere({
      search,
      brandSlug,
      gender,
      concentration,
      isActive: true,
      isLimited,
    });

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          brand: {
            select: { name: true, slug: true },
          },
          variants: {
            where: { 
              isActive: true,
              deletedAt: null,
              isPrimary: true,
            },
            take: 1,
            select: {
              stock: true,
              reserved: true,
              price: true,
              discount: true,
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
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
        items: items,
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
  ): Promise<ServiceResponseT<{ 
    items: { id: number; name: string; slug: string; }[], 
    nextCursor: number | null
  }>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const products = await prisma.product.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
      where: {
        isActive: true,
        deletedAt: null,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { createdAt: "asc" },
    }); 

    let nextCursor: number | null = null;
  
    if (products.length > limit) {
      products.pop();
      nextCursor = products[products.length - 1]?.id || null;
    }

    return {
      data: {
        items: products,
        nextCursor,
      },
      success: true,
      message: null,
    };
  }

  async selectOptionListProductVariants(
    query: { productSlug: string; limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<{ 
    items: { id: number; name: string; slug: string; }[], 
    nextCursor: number | null
  }>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;
    const slug = query.productSlug;

    const variants = await prisma.productVariant.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
      where: {
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
      },
      select: {
        id: true,
        size: true,
        slug: true,
      },
      orderBy: { createdAt: "asc" },
    }); 

    let nextCursor: number | null = null;
  
    if (variants.length > limit) {
      variants.pop();
      nextCursor = variants[variants.length - 1]?.id || null;
    }

    const items = variants.map((variant) => ({
      id: variant.id,
      name: `${variant.size} ml`,
      slug: variant.slug,
    }));

    return {
      data: {
        items,
        nextCursor,
      },
      success: true,
      message: null,
    };
  }
}
