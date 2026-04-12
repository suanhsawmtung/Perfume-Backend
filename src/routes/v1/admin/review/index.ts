import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  getReview,
  listReviews,
  togglePublishing
} from "../../../../controllers/admin/review.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listReviews
);

router.get(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getReview
);

router.patch(
  "/:id/toggle-publish",
  isAuthenticated,
  permit(true, Role.ADMIN),
  togglePublishing
);

// router.delete(
//   "/:id",
//   isAuthenticated,
//   permit(true, Role.ADMIN),
//   deleteReview
// );

export default router;
