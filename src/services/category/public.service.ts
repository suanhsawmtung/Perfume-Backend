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
}
