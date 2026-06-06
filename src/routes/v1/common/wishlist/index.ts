import express, { Router } from "express";
import {
    addToWishlist,
    listMyWishlist,
    removeFromWishlist
} from "../../../../controllers/common/wishlist.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { normalLimiter } from "../../../../middlewares/rate-limiter";

const router: Router = express.Router();

// Authenticated routes
router.get("/", isAuthenticated, normalLimiter, listMyWishlist);
router.post("/:productId", isAuthenticated, normalLimiter, addToWishlist);
router.delete("/:productId", isAuthenticated, normalLimiter, removeFromWishlist);

export default router;
