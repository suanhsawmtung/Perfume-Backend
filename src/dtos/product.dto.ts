import { ProductCardQueryDataT, ProductCardT } from "../types/product";

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
}
