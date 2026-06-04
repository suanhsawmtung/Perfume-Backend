import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ListPublicCategoryT } from "../../types/category";
import { CursorPaginationResultT, ServiceResponseT } from "../../types/common";
import { ICategoryService } from "./category.interface";

export class CategoryService implements ICategoryService {
  async listPublicCategories(): Promise<ServiceResponseT<ListPublicCategoryT[]>> {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: categories,
      message: null,
    };
  }

  async selectOptionListCategories(
    query: { limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<CursorPaginationResultT<ListPublicCategoryT>>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }),
    }

    const [items, totalCount] = await Promise.all([
      prisma.category.findMany({
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
      prisma.category.count({ where }),
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
