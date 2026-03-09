import express, { Router } from "express";
import {
    authCheckLimiter,
    authLimiter,
    normalLimiter,
} from "../../middlewares/rate-limiter";
import adminBrandRoutes from "./admin/brand";
import adminCategoryRoutes from "./admin/category";
import adminOrderRoutes from "./admin/order";
import adminPostRoutes from "./admin/post";
import adminProductRoutes from "./admin/product";
import adminReviewRoutes from "./admin/review";
import adminSettingRoutes from "./admin/setting";
import adminUserRoutes from "./admin/user";
import authRoutes from "./auth";
import authCheckRoutes from "./common/auth-check";
import brandRoutes from "./common/brand";
import categoryRoutes from "./common/category";
import productRoutes from "./common/product";
import profileRoutes from "./common/profile";
import userRoutes from "./common/user";

const router: Router = express.Router();

router.use("/auth", authLimiter, authRoutes);

router.use("/admin/users", normalLimiter, adminUserRoutes);
router.use("/admin/setting", normalLimiter, adminSettingRoutes);
router.use("/admin/brands", normalLimiter, adminBrandRoutes);
router.use("/admin/categories", normalLimiter, adminCategoryRoutes);
router.use("/admin/posts", normalLimiter, adminPostRoutes);
router.use("/admin/products", normalLimiter, adminProductRoutes);
router.use("/admin/orders", normalLimiter, adminOrderRoutes);
router.use("/admin/reviews", normalLimiter, adminReviewRoutes);

router.use("/auth-check", authCheckLimiter, authCheckRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/profile", profileRoutes);
router.use("/products", productRoutes);
router.use("/users", userRoutes);

export default router;
