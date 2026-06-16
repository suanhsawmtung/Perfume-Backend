import { descriptions } from "jest-config";
import { ProductCardQueryDataT, ProductCardT, ProductDetailQueryDataT, ProductDetailT } from "../types/product";

export class ProductDto {
  static toProductCard(product: ProductCardQueryDataT): ProductCardT {
    const primaryVariant = product.variants[0];

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      rating: product.rating ? Number(product.rating) : null,
      ratingCount: product.ratingCount,
      gender: product.gender,
      concentration: product.concentration,
      isLimited: product.isLimited,
      brand: {
        name: product.brand.name,
        slug: product.brand.slug,
      },
      image: primaryVariant?.images[0]?.path || null,
      primaryVariant: {
        price: Number(primaryVariant?.price || 0),
        discount: Number(primaryVariant?.discount || 0),
        stock: primaryVariant?.stock || 0,
        reserved: primaryVariant?.reserved || 0,
      },
    };
  }

  static toProductDetail(data: ProductDetailQueryDataT, authUserId: number | null): ProductDetailT {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      rating: data.rating ? Number(data.rating) : null,
      ratingCount: data.ratingCount,
      gender: data.gender,
      description: data.description,
      concentration: data.concentration,
      isLimited: data.isLimited,
      releasedYear: data.releasedYear,
      brand: data.brand.name,
      variants: data.variants.map(variant => ({
        id: variant.id,
        size: variant.size,
        slug: variant.slug,
        stock: variant.stock,
        reserved: variant.reserved,
      })),
      selectedVariant: {
        id: data.selectedVariant.id,
        slug: data.selectedVariant.slug,
        size: data.selectedVariant.size,
        price: Number(data.selectedVariant.price || 0),
        discount: Number(data.selectedVariant.discount || 0),
        stock: data.selectedVariant.stock || 0,
        reserved: data.selectedVariant.reserved || 0,
        isPrimary: data.selectedVariant.isPrimary,
        images: data.selectedVariant.images,
      },
      isWishlist: data.wishlists?.some(wishlist => wishlist.userId === authUserId) || false,
      hasReviewed: data.reviews?.some(review => review.userId === authUserId) || false,
      canReview: !!authUserId && data.variants.some(v => !!v.orderItems?.length),
    };
  }
}
