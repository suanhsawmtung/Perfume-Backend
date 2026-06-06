import { ProductCardQueryDataT, ProductCardT } from "../types/product";
import { WishlistCardQueryData, WishlistCardT } from "../types/wishlist";

export class WishlistDto {
    static toWishlistCard(wishlist: WishlistCardQueryData): WishlistCardT {
        const primaryVariant = wishlist.product.variants[0];

        return {
            id: wishlist.id,
            createdAt: wishlist.createdAt,
            product: {
                id: wishlist.product.id,
                name: wishlist.product.name,
                slug: wishlist.product.slug,
                brand: wishlist.product.brand.name,
                image: primaryVariant?.images[0]?.path || null,
                price: Number(primaryVariant?.price || 0),
                discount: Number(primaryVariant?.discount || 0),
                primaryVariantId: primaryVariant?.id || null,
                primaryVariantSlug: primaryVariant?.slug || null,
            },
        };
    }
}
