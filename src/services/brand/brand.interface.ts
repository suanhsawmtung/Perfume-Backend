import { Brand } from "@prisma/client";
import { CreateBrandParams, ListBrandResultT, ListBrandsParams, ListBrandT, ListSelectOptionBrandT, UpdateBrandParams } from "../../types/brand";
import { ServiceResponseT } from "../../types/common";

export interface IBrandService {
  listPublicBrands(): Promise<ServiceResponseT<ListSelectOptionBrandT[]>>;
  selectOptionListBrands(query: { limit?: number; cursor?: number | null; search?: string | undefined }): Promise<ServiceResponseT<{ 
    items: ListSelectOptionBrandT[], 
    nextCursor: number | null
  }>>;
}

export interface IAdminBrandService {
  listBrands(params: ListBrandsParams): Promise<ServiceResponseT<ListBrandResultT>>;
  getBrandDetail(slug: string): Promise<ServiceResponseT<ListBrandT>>;
  createBrand(params: CreateBrandParams): Promise<ServiceResponseT<Brand>>;
  updateBrand(slug: string, params: UpdateBrandParams): Promise<ServiceResponseT<Brand>>;
  deleteBrand(slug: string): Promise<ServiceResponseT<null>>;
}