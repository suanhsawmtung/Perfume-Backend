import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createPayment,
  getPaymentDetail,
  listPayments,
  processPayment,
  updatePayment,
  voidPayment
} from "../../../../controllers/admin/payment.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  createPaymentValidation,
  processPaymentValidation,
  updatePaymentValidation,
} from "../../../../validations/payment.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listPayments
);

router.get(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getPaymentDetail
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createPaymentValidation,
  handleValidationError,
  createPayment
);

router.patch(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updatePaymentValidation,
  handleValidationError,
  updatePayment
);

router.patch(
  "/:id/void",
  isAuthenticated,
  permit(true, Role.ADMIN),
  voidPayment
);

router.patch(
  "/:id/process",
  isAuthenticated,
  permit(true, Role.ADMIN),
  processPaymentValidation,
  handleValidationError,
  processPayment
);

export default router;
