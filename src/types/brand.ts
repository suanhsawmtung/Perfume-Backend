import { Brand } from "@prisma/client";

export type ListBrandsParams = {
  limit?: number;
  offset?: number;
  search?: string | undefined;
};

export type CreateBrandParams = {
  name: string;
};

export type UpdateBrandParams = {
  name: string;
};

export type ParseBrandQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
};

export type ListSelectOptionBrandT = {
  id: number;
  name: string;
  slug: string;
};

export type ListBrandT = Brand & {
  _count: {
    products: number;
  };
};

export type ListBrandResultT = {
  items: ListBrandT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};
  

