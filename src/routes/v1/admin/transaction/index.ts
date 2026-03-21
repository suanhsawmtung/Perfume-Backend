import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createTransaction,
  getTransactionDetail,
  listTransactions,
  updateTransaction
} from "../../../../controllers/admin/transaction.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  createTransactionValidation,
  updateTransactionValidation,
} from "../../../../validations/transaction.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listTransactions
);

router.get(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getTransactionDetail
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createTransactionValidation,
  handleValidationError,
  createTransaction
);

router.patch(
  "/:id",
  isAuthenticated,
  permit(true, Role.ADMIN),
  updateTransactionValidation,
  handleValidationError,
  updateTransaction
);

export default router;
