import { Role } from "@prisma/client";
import express, { Router } from "express";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrder
} from "../../../../controllers/admin/order.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { parseJsonFields } from "../../../../middlewares/parse-json-fields";
import {
  createOrderValidation,
  updateOrderValidation,
} from "../../../../validations/order.validation";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listOrders
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  // uploadOrderImage,
  // handleMulterError,
  parseJsonFields(["items"]),
  createOrderValidation,
  handleValidationError,
  createOrder
);

router.get(
  "/:code",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getOrder
);

router.patch(
  "/:code",
  isAuthenticated,
  permit(true, Role.ADMIN),
  // uploadOrderImage,
  // handleMulterError,
  parseJsonFields(["items"]),
  updateOrderValidation,
  handleValidationError,
  updateOrder
);

export default router;
