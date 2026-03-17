import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createRefund,
  deleteRefund,
  getRefundDetail,
  listRefunds,
  updateRefund,
} from "../../../../controllers/admin/refund.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  createRefundValidation,
  updateRefundValidation,
} from "../../../../validations/refund.validation";

const router: Router = express.Router();

router.get(
  "/", 
  isAuthenticated, 
  permit(true, Role.ADMIN), 
  listRefunds
);

router.get(
  "/:id", 
  isAuthenticated, 
  permit(true, Role.ADMIN), 
  getRefundDetail
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createRefundValidation,
  handleValidationError,
  createRefund
);

router.patch(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updateRefundValidation,
  handleValidationError,
  updateRefund
);

router.delete(
  "/:id", 
  isAuthenticated, 
  permit(true, Role.ADMIN), 
  deleteRefund
);

export default router;
