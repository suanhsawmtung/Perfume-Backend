import {
  Brand,
  Concentration,
  Gender,
  Image,
  OrderItem,
  Product,
  ProductVariant,
  ProductWishlist,
  Review
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

export type ListProductT = ProductCardT;

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

export type ProductDetailQueryDataT = Pick<Product,
  "id" |
  "name" |
  "slug" |
  "description" |
  "gender" |
  "concentration" |
  "isLimited" |
  "rating" |
  "ratingCount" |
  "releasedYear"
> & {
  brand: Pick<Brand, "name">;
  variants: (Pick<ProductVariant,
    "id" |
    "slug" |
    "size" |
    "price" |
    "discount" |
    "stock" |
    "reserved" |
    "isPrimary"> & {
      images: Pick<Image, "path" | "isPrimary" | "order">[];
      orderItems?: { id: number }[]
    })[];
  wishlists?: ProductWishlist[];
  reviews?: Review[];
  selectedVariant: Pick<ProductVariant,
    "id" |
    "slug" |
    "size" |
    "price" |
    "discount" |
    "stock" |
    "reserved" |
    "isPrimary"> & {
      images: Pick<Image, "path" | "isPrimary" | "order">[];
      orderItems?: { id: number }[]
    };
};

export type ProductDetailT = {
  id: number;
  name: string;
  slug: string;
  description: string;
  gender: Gender;
  concentration: Concentration;
  isLimited: boolean;
  rating: number | null;
  ratingCount: number;
  releasedYear: number | null;
  brand: string;
  hasReviewed: boolean;
  variants: {
    id: number;
    size: number;
    slug: string;
    stock: number;
    reserved: number;
  }[];
  isWishlist: boolean;
  canReview: boolean;
  selectedVariant: {
    id: number;
    slug: string;
    size: number;
    price: number;
    discount: number;
    stock: number;
    reserved: number;
    isPrimary: boolean;
    images: {
      path: string;
      isPrimary: boolean;
      order: number;
    }[];
  };
}

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

export type ProductCardQueryDataT = Pick<Product, "id" | "name" | "slug" | "rating" | "ratingCount" | "gender" | "concentration" | "isLimited"> & {
  brand: Pick<Brand, "name" | "slug">;
  variants: (Pick<ProductVariant, "price" | "discount" | "stock" | "reserved"> & {
    images: Pick<Image, "path">[];
  })[];
};

export type ProductCardT = {
  id: number;
  name: string;
  slug: string;
  rating: number | null;
  ratingCount: number;
  gender: Gender;
  concentration: Concentration;
  isLimited: boolean;
  brand: {
    name: string;
    slug: string;
  };
  image: string | null;
  primaryVariant: {
    price: number;
    discount: number;
    stock: number;
    reserved: number;
  };
};
