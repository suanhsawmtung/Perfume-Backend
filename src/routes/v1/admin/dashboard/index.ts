import { Role } from "@prisma/client";
import express, { Router } from "express";
import { getDashboardData } from "../../../../controllers/admin/dashboard.controller";
import { permit } from "../../../../middlewares/check-permissions";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

router.get(
  "/",
  isAuthenticated,
  permit(true, Role.ADMIN),
  getDashboardData
);

export default router;