import { Brand, Image, Product, ProductVariant, ProductWishlist } from "@prisma/client";
import { CursorPaginationParams, CursorPaginationResultT } from "./common";

export type ListWishlistsParams = {
  search?: string | undefined;
} & CursorPaginationParams;

export type WishlistCardQueryData = ProductWishlist & {
  product: Pick<Product, "id" | "name" | "slug"> & {
    brand: Pick<Brand, "name">;
    variants: (Pick<ProductVariant, "id" | "slug" | "price" | "discount" | "stock" | "reserved"> & {
      images: Pick<Image, "path">[];
    })[];
  };
};

export type WishlistCardT = {
  id: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string;
    image: string | null;
    price: number;
    discount: number;
    primaryVariantId: number | null;
    primaryVariantSlug: string | null;
  }
}

export type MyWishlistResultT = CursorPaginationResultT<WishlistCardT>;

export type ToggleWishlistResponseT = {
  isAdded: boolean;
  message: string;
};
