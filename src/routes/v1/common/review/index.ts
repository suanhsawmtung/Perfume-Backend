import express, { Router } from "express";
import {
    getReviewDetail,
    listMyReviews,
    upsertReview
} from "../../../../controllers/common/review.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

// Public routes
router.get("/:id", getReviewDetail);

// Authenticated routes
router.get("/my/all", isAuthenticated, listMyReviews);
router.post("/", isAuthenticated, upsertReview);

export default router;
