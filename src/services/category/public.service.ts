import { prisma } from "../../lib/prisma";
import { ListPublicCategoryT } from "../../types/category";
import { ServiceResponseT } from "../../types/common";
import { IPublicCategoryService } from "./category.interface";

export class PublicCategoryService implements IPublicCategoryService {
  async listPublicCategories(): Promise<ServiceResponseT<ListPublicCategoryT[]>> {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
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
  ): Promise<ServiceResponseT<{ 
    items: ListPublicCategoryT[], 
    nextCursor: number | null
  }>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const categories = await prisma.category.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
      where: {
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
      orderBy: { id: "asc" },
    });

    let nextCursor: number | null = null;

    if (categories.length > limit) {
      categories.pop();
      nextCursor = categories[categories.length - 1]?.id || null;
    }

    return {
      data: {
        items: categories,
        nextCursor,
      },
      success: true,
      message: null,
    };
  }
}
