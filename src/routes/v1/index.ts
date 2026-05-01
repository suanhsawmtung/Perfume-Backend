import express, { Router } from "express";
import {
    authCheckLimiter,
    authLimiter,
    normalLimiter,
} from "../../middlewares/rate-limiter";
import adminBrandRoutes from "./admin/brand";
import adminCategoryRoutes from "./admin/category";
import adminDashboardRoutes from "./admin/dashboard";
import adminInventoryRoutes from "./admin/inventory";
import adminOrderRoutes from "./admin/order";
import adminPaymentRoutes from "./admin/payment";
import adminPostRoutes from "./admin/post";
import adminProductRoutes from "./admin/product";
import adminRefundRoutes from "./admin/refund";
import adminReviewRoutes from "./admin/review";
import adminTransactionRoutes from "./admin/transaction";
import adminUserRoutes from "./admin/user";
import authRoutes from "./auth";
import authCheckRoutes from "./common/auth-check";
import brandRoutes from "./common/brand";
import categoryRoutes from "./common/category";
import productRoutes from "./common/product";
import reviewRoutes from "./common/review";
import userRoutes from "./common/user";
import wishlistRoutes from "./common/wishlist";

const router: Router = express.Router();

router.use("/auth", authLimiter, authRoutes);

router.use("/admin/users", normalLimiter, adminUserRoutes);
router.use("/admin/brands", normalLimiter, adminBrandRoutes);
router.use("/admin/categories", normalLimiter, adminCategoryRoutes);
router.use("/admin/posts", normalLimiter, adminPostRoutes);
router.use("/admin/products", normalLimiter, adminProductRoutes);
router.use("/admin/orders", normalLimiter, adminOrderRoutes);
router.use("/admin/reviews", normalLimiter, adminReviewRoutes);
router.use("/admin/refunds", normalLimiter, adminRefundRoutes);
router.use("/admin/payments", normalLimiter, adminPaymentRoutes);
router.use("/admin/transactions", normalLimiter, adminTransactionRoutes);
router.use("/admin/inventories", normalLimiter, adminInventoryRoutes);
router.use("/admin/dashboard", normalLimiter, adminDashboardRoutes);

router.use("/auth-check", authCheckLimiter, authCheckRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/users", userRoutes);
router.use("/wishlists", wishlistRoutes);

export default router;
