import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { CursorPaginationResultT, SelectOptionT, ServiceResponseT } from "../../types/common";
import { IBrandService } from "./brand.interface";

export class BrandService implements IBrandService {
  async listPublicBrands(): Promise<ServiceResponseT<SelectOptionT[]>> {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      data: brands,
      success: true,
      message: null,
    };
  }

  async selectOptionListBrands(
    query: { limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<CursorPaginationResultT<SelectOptionT>>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    }

    const [items, totalCount] = await Promise.all([
      prisma.brand.findMany({
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
      prisma.brand.count({ where }),
    ]);

    let nextCursor: number | null = null;

    if (items.length > limit) {
      items.pop();
      nextCursor = items[items.length - 1]?.id || null;
    }

    return {
      data: {
        items,
        nextCursor,
        totalCount,
      },
      success: true,
      message: null,
    };
  }
}