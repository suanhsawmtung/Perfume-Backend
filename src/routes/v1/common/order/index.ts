import express, { Router } from "express";
import { cancelMyOrder, listMyOrders } from "../../../../controllers/common/order.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { normalLimiter } from "../../../../middlewares/rate-limiter";
import { handleValidationError } from "../../../../middlewares/error-handler";
import { cancelMyOrderValidation } from "../../../../validations/order.validation";

const router: Router = express.Router();

router.get(
    "/",
    isAuthenticated,
    normalLimiter,
    listMyOrders
);

router.patch(
    "/:code/cancel",
    isAuthenticated,
    normalLimiter,
    cancelMyOrderValidation,
    handleValidationError,
    cancelMyOrder
)

export default router;
