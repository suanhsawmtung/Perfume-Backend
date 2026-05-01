import { Product, ProductVariant } from "@prisma/client";
import { ServiceResponseT } from "../../types/common";
import {
  AdminListProductResultT,
  AdminProductDetailT,
  CreateProductParams,
  CreateProductVariantParams,
  ListProductResultT,
  ListProductsParams,
  ProductDetailT,
  ProductVariantDetailType,
  UpdateProductNewParams,
  UpdateProductVariantParams,
} from "../../types/product";

export interface IAdminProductService {
  listProducts(params: ListProductsParams): Promise<ServiceResponseT<AdminListProductResultT>>;
  getProductDetail(slug: string): Promise<ServiceResponseT<AdminProductDetailT>>;
  createProduct(params: CreateProductParams): Promise<ServiceResponseT<Product>>;
  updateProduct(slug: string, params: UpdateProductNewParams): Promise<ServiceResponseT<Product>>;
  deleteProduct(slug: string): Promise<ServiceResponseT<null>>;
  
  // Product Variant Management
  createVariant(params: CreateProductVariantParams): Promise<ServiceResponseT<ProductVariant>>;
  updateVariant(variantSlug: string, params: UpdateProductVariantParams): Promise<ServiceResponseT<ProductVariant>>;
  deleteVariant(variantSlug: string): Promise<ServiceResponseT<null>>;
  getVariantDetail(variantSlug: string): Promise<ServiceResponseT<ProductVariantDetailType>>;
}

export interface IProductService {
  listProducts(params: ListProductsParams): Promise<ServiceResponseT<ListProductResultT>>;
  getProductDetail(slug: string): Promise<ServiceResponseT<ProductDetailT>>;
  selectOptionListProducts(
    query: { limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<{ 
    items: { id: number; name: string; slug: string; }[], 
    nextCursor: number | null
  }>>;
  selectOptionListProductVariants(
    query: { limit?: number; cursor?: number | null; search?: string | undefined; productSlug: string }
  ): Promise<ServiceResponseT<{ 
    items: { id: number; name: string; slug: string; }[], 
    nextCursor: number | null
  }>>;
}
