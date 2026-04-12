import { Category } from "@prisma/client";
import { CreateCategoryParams, ListCategoriesParams, ListCategoryResultT, ListCategoryT, ListPublicCategoryT, UpdateCategoryParams } from "../../types/category";
import { ServiceResponseT } from "../../types/common";

export interface IPublicCategoryService {
  listPublicCategories(): Promise<ServiceResponseT<ListPublicCategoryT[]>>;
}

export interface IAdminCategoryService {
  listCategories(params: ListCategoriesParams): Promise<ServiceResponseT<ListCategoryResultT>>;
  getCategoryDetail(slug: string): Promise<ServiceResponseT<ListCategoryT>>;
  createCategory(params: CreateCategoryParams): Promise<ServiceResponseT<Category>>;
  updateCategory(slug: string, params: UpdateCategoryParams): Promise<ServiceResponseT<Category>>;
  deleteCategory(slug: string): Promise<ServiceResponseT<null>>;
}
