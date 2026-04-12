import { prisma } from "../../lib/prisma";
import { ListPublicBrandT } from "../../types/brand";
import { ServiceResponseT } from "../../types/common";
import { IPublicBrandService } from "./brand.interface";

export class PublicBrandService implements IPublicBrandService {
  async listPublicBrands(): Promise<ServiceResponseT<ListPublicBrandT[]>> {
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
}