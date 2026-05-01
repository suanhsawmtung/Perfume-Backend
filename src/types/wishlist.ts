import { Brand, Image, Product, ProductVariant, ProductWishlist } from "@prisma/client";
import { CursorPaginationResultT } from "./common";

export type WishlistItemT = ProductWishlist & {
  product: Pick<Product, "id" | "name" | "slug"> & {
    brand: Pick<Brand, "name">;
    variants: Pick<ProductVariant, "price" | "discount" | "stock" | "reserved"> & {
      images: Pick<Image, "path">[];
    }[];
  };
};

export type MyWishlistResultT = CursorPaginationResultT<WishlistItemT>;

export type ToggleWishlistResponseT = {
  isAdded: boolean;
  message: string;
};
