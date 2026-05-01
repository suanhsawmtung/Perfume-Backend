import { Category } from "@prisma/client";
import { CreateCategoryParams, ListCategoriesParams, ListCategoryResultT, ListCategoryT, ListPublicCategoryT, UpdateCategoryParams } from "../../types/category";
import { ServiceResponseT } from "../../types/common";

export interface ICategoryService {
  listPublicCategories(): Promise<ServiceResponseT<ListPublicCategoryT[]>>;
  selectOptionListCategories(query: { limit?: number; cursor?: number | null; search?: string | undefined }): Promise<ServiceResponseT<{ 
    items: ListPublicCategoryT[], 
    nextCursor: number | null
  }>>;
}

export interface IAdminCategoryService {
  listCategories(params: ListCategoriesParams): Promise<ServiceResponseT<ListCategoryResultT>>;
  getCategoryDetail(slug: string): Promise<ServiceResponseT<ListCategoryT>>;
  createCategory(params: CreateCategoryParams): Promise<ServiceResponseT<Category>>;
  updateCategory(slug: string, params: UpdateCategoryParams): Promise<ServiceResponseT<Category>>;
  deleteCategory(slug: string): Promise<ServiceResponseT<null>>;
}
