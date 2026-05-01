import {
  Brand,
  Concentration,
  Gender,
  Image,
  Product,
  ProductVariant,
  ProductWishlist
} from "@prisma/client";

export type ListProductsParams = {
  limit?: number | string;
  offset?: number | string;
  search?: string | undefined;
  brandSlug?: string | undefined;
  gender?: Gender | undefined;
  concentration?: Concentration | undefined;
  isActive?: boolean | undefined;
  isLimited?: boolean | undefined;
}

export type AdminListProductT = Product & {
  brand: Pick<Brand, "name">;
  _count: {
    variants: number;
  };
};

export type AdminListProductResultT = {
  items: AdminListProductT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type ListProductT = Product & {
  brand: Pick<Brand, "name" | "slug">;
  variants: (Pick<ProductVariant, "price" | "discount" | "stock" | "reserved"> & {
    images: Pick<Image, "path">[];
  })[];
};

export type ListProductResultT = {
  items: ListProductT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type BuildProductWhereParams = {
  search?: string | undefined;  
  brandSlug?: string | undefined;
  gender?: Gender | undefined;
  concentration?: Concentration | undefined;
  isActive?: boolean | undefined;
  isLimited?: boolean | undefined;
};

export type AdminProductDetailT = Product & {
  brand: Brand;
  variants: (ProductVariant & {
    images: Pick<Image, "path" | "isPrimary" | "order">[];
  })[];
  _count: {
    variants: number;
    reviews: number;
  };
};

export type ProductDetailT = Product & {
  brand: Brand;
  variants: (ProductVariant & {
    images: Pick<Image, "path" | "isPrimary" | "order">[];
  })[];
  wishlists: ProductWishlist[];
};

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
  price: number | string;
  discount?: number | string;
  imageFilenames?: string[];
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UpdateProductVariantParams = {
  productId?: number | string;
  size: number | string;
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

export type ProductVariantDetailType = ProductVariant & {
  product: {
    id: number;
    slug: string;
    name: string;
    brand: {
      name: string;
    };
  };
  images: Pick<Image, "path" | "isPrimary" | "order">[];
};
