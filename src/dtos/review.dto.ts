import { ProductCardQueryDataT, ProductCardT } from "../types/product";
import { ReviewCardQueryData, ReviewCardT } from "../types/review";

export class ReviewDto {
    static toReviewCard(review: ReviewCardQueryData): ReviewCardT {
        const primaryVariant = review.product.variants[0];

        return {
            ...review,
            product: {
                id: review.product.id,
                name: review.product.name,
                slug: review.product.slug,
                brand: review.product.brand.name,
                image: primaryVariant?.images[0]?.path || null,
            },
        };
    }
}
