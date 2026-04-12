import { Product, ProductVariant } from "@prisma/client";
import { ServiceResponseT } from "../../types/common";
import {
  CreateProductParams,
  CreateProductVariantParams,
  ListProductResultT,
  ListProductsParams,
  UpdateProductNewParams,
  UpdateProductVariantParams,
} from "../../types/product";

export interface IAdminProductService {
  listProducts(params: ListProductsParams): Promise<ServiceResponseT<ListProductResultT>>;
  getProductDetail(slug: string): Promise<ServiceResponseT<any>>;
  createProduct(params: CreateProductParams): Promise<ServiceResponseT<Product>>;
  updateProduct(slug: string, params: UpdateProductNewParams): Promise<ServiceResponseT<Product>>;
  deleteProduct(slug: string): Promise<ServiceResponseT<null>>;
  
  // Product Variant Management
  createVariant(params: CreateProductVariantParams): Promise<ServiceResponseT<ProductVariant>>;
  updateVariant(variantSlug: string, params: UpdateProductVariantParams): Promise<ServiceResponseT<ProductVariant>>;
  deleteVariant(variantSlug: string): Promise<ServiceResponseT<null>>;
  getVariantDetail(variantSlug: string): Promise<ServiceResponseT<any>>;
}

export interface IPublicProductService {
  listProducts(params: ListProductsParams): Promise<ServiceResponseT<ListProductResultT>>;
  getProductDetail(slug: string): Promise<ServiceResponseT<any>>;
}
