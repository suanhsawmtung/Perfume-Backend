import { Role } from "@prisma/client";
import express, { Router } from "express";
import { setMaintenance } from "../../../../controllers/admin/setting.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { setMaintenanceValidation } from "../../../../validations/setting.validation";

const router: Router = express.Router();

router.post(
  "/set-maintenance",
  isAuthenticated,
  permit(true, Role.ADMIN),
  setMaintenanceValidation,
  handleValidationError,
  setMaintenance
);

export default router;
