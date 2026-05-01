import express, { Router } from "express";
import {
    listMyWishlist,
    toggleWishlist,
} from "../../../../controllers/common/wishlist.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

// Authenticated routes
router.get("/my/all", isAuthenticated, listMyWishlist);
router.post("/toggle", isAuthenticated, toggleWishlist);

export default router;
