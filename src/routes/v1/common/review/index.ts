import express, { Router } from "express";
import {
    getReviewDetail,
    listMyReviews,
    createReview,
    updateReview,
    deleteReview
} from "../../../../controllers/common/review.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
    createReviewValidation,
    updateReviewValidation,
    deleteReviewValidation
} from "../../../../validations/review.validation";

const router: Router = express.Router();

// Public routes
router.get("/:id", getReviewDetail);

// Authenticated routes
router.get("/", isAuthenticated, listMyReviews);
router.post(
    "/",
    isAuthenticated,
    createReviewValidation,
    handleValidationError,
    createReview
);
router.patch(
    "/:id",
    isAuthenticated,
    updateReviewValidation,
    handleValidationError,
    updateReview
);
router.delete(
    "/:id",
    isAuthenticated,
    deleteReviewValidation,
    handleValidationError,
    deleteReview
);

export default router;
