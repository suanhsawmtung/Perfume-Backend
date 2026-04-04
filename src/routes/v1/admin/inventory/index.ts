import { Role } from "@prisma/client";
import express, { Router } from "express";
import { createInventory, listInventories } from "../../../../controllers/admin/inventory.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { createInventoryValidation, listInventoriesValidation } from "../../../../validations/inventory.validation";

const router: Router = express.Router();

router.get(
  "/:type",
  isAuthenticated,
  permit(true, Role.ADMIN),
  listInventoriesValidation,
  handleValidationError,
  listInventories
);

router.post(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  createInventoryValidation,
  handleValidationError,
  createInventory
);

export default router;