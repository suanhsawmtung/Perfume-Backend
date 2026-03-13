import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  listProductRatingSummary,
  listProductRatings,
} from "../../../../controllers/admin/product-rating.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listProductRatings
);

router.get(
  "/summary",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listProductRatingSummary
);

export default router;
