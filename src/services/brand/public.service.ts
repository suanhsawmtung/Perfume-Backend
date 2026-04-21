import { prisma } from "../../lib/prisma";
import { ListSelectOptionBrandT } from "../../types/brand";
import { ServiceResponseT } from "../../types/common";
import { IPublicBrandService } from "./brand.interface";

export class PublicBrandService implements IPublicBrandService {
  async listPublicBrands(): Promise<ServiceResponseT<ListSelectOptionBrandT[]>> {
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
  ): Promise<ServiceResponseT<{ 
    items: ListSelectOptionBrandT[], 
    nextCursor: number | null
  }>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const brands = await prisma.brand.findMany({
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
  
    if (brands.length > limit) {
      brands.pop();
      nextCursor = brands[brands.length - 1]?.id || null;
    }

    return {
      data: {
        items: brands,
        nextCursor,
      },
      success: true,
      message: null,
    };
  }
}