import express, { Router } from "express";
import {
    getProduct,
    listProducts,
    selectOptionListProducts,
    selectOptionListProductVariants,
} from "../../../../controllers/common/product.controller";
import { createReview, deleteReview, listProductReviews, updateReview } from "../../../../controllers/common/review.controller";
import { isAuthenticated, tryAuthenticate } from "../../../../middlewares/ensure-authenticated";
import { createReviewValidation, deleteReviewValidation, updateReviewValidation } from "../../../../validations/review.validation";
import { handleValidationError } from "../../../../middlewares/error-handler";

const router: Router = express.Router();

router.get(
    "/",
    tryAuthenticate,
    listProducts
);

router.get(
    "/:slug",
    tryAuthenticate,
    getProduct
);

router.get("/:productId/reviews", listProductReviews);

router.post(
    "/:productId/reviews",
    isAuthenticated,
    createReviewValidation,
    handleValidationError,
    createReview
);

router.patch(
    "/:productId/reviews/:id",
    isAuthenticated,
    updateReviewValidation,
    handleValidationError,
    updateReview
);

router.delete(
    "/:productId/reviews/:id",
    isAuthenticated,
    deleteReviewValidation,
    handleValidationError,
    deleteReview
);

router.get("/select-options", selectOptionListProducts);

router.get("/:productSlug/variants/select-options", selectOptionListProductVariants);

export default router;
