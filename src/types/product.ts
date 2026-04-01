import { Concentration, Gender, VariantSource } from "@prisma/client";

export type ListProductsParams = {
  pageSize: number;
  offset: number;
  search?: string | undefined;  
  brandSlug?: string | undefined;
  gender?: Gender | undefined;
  concentration?: Concentration | undefined;
  isActive?: boolean | undefined;
  isLimited?: boolean | undefined;
}

export type BuildProductWhereParams = Omit<
  ListProductsParams,
  "pageSize" | "offset"
>;

// export type CreateProductParams = {
//   name: string;
//   description: string;
//   price: number | string;
//   discount?: number | string;
//   inventory?: number | string;
//   status?: Status;
//   materialId: number | string;
//   typeId: number | string;
//   brandId: number | string;
//   imageFilenames?: string[];
// };

export type CreateProductParams = {
  name: string;
  description: string;
  concentration: Concentration;
  gender: Gender;
  brandId: number | string;
  isActive?: boolean;
  isLimited?: boolean;
  releasedYear?: number | string;
};

// export type UpdateProductParams = {
//   name: string;
//   description: string;
//   price: number | string;
//   discount?: number | string;
//   inventory?: number | string;
//   status?: Status;
//   materialId: number | string;
//   typeId: number | string;
//   brandId: number | string;
//   imageFilenames?: string[];
//   imageIds?: string | number[] | string[];
// };

export type UpdateProductNewParams = {
  name: string;
  description: string;
  concentration: Concentration;
  gender: Gender;
  brandId: number | string;
  isActive?: boolean;
  isLimited?: boolean;
  releasedYear?: number | string;
};

export type CreateProductVariantParams = {
  productId?: number | string;
  size: number | string;
  source?: VariantSource;
  price: number | string;
  discount?: number | string;
  imageFilenames?: string[];
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UpdateProductVariantParams = {
  productId?: number | string;
  size: number | string;
  source?: VariantSource;
  price: number | string;
  discount?: number | string;
  imageFilenames?: string[];
  existingImages?: string[];
  imageLayout?: string[];
  isPrimary?: boolean;
  isActive?: boolean;
};

export type ParseProductQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  brandSlug?: string | undefined;
  gender?: Gender | undefined;
  concentration?: Concentration | undefined;
  isActive?: boolean | undefined;
  isLimited?: boolean | undefined;
};
