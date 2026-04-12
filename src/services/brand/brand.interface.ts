import { Brand } from "@prisma/client";
import { CreateBrandParams, ListBrandResultT, ListBrandsParams, ListBrandT, ListPublicBrandT, UpdateBrandParams } from "../../types/brand";
import { ServiceResponseT } from "../../types/common";

export interface IPublicBrandService {
  listPublicBrands(): Promise<ServiceResponseT<ListPublicBrandT[]>>;
}

export interface IAdminBrandService {
  listBrands(params: ListBrandsParams): Promise<ServiceResponseT<ListBrandResultT>>;
  getBrandDetail(slug: string): Promise<ServiceResponseT<ListBrandT>>;
  createBrand(params: CreateBrandParams): Promise<ServiceResponseT<Brand>>;
  updateBrand(slug: string, params: UpdateBrandParams): Promise<ServiceResponseT<Brand>>;
  deleteBrand(slug: string): Promise<ServiceResponseT<null>>;
}