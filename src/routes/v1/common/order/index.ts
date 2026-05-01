import express, { Router } from "express";
import { listMyOrders } from "../../../../controllers/common/order.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

// Authenticated routes
router.get("/my/all", isAuthenticated, listMyOrders);

export default router;
