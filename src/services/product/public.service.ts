import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { ListProductResultT, ListProductsParams } from "../../types/product";
import { createError } from "../../utils/common";
import { errorCode } from "../../../config/error-code";
import {
  buildProductWhere,
  findProductDetail,
  parseProductQueryParams,
  requireSlug,
} from "./product.helpers";
import { IPublicProductService } from "./product.interface";

export class PublicProductService implements IPublicProductService {
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
            where: { isActive: true, deletedAt: null },
            include: {
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          _count: {
            select: { variants: { where: { isActive: true, deletedAt: null } } },
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
        items: items as any[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getProductDetail(slug: string): Promise<ServiceResponseT<any>> {
    const normalizedSlug = requireSlug(slug);
    
    // Using findProductDetail which already includes variants and images
    const product = await findProductDetail(normalizedSlug);

    if (!product || !product.isActive) {
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
}
