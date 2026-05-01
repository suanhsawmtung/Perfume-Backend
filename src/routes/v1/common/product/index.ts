import express, { Router } from "express";
import {
    getProduct,
    listProducts,
    selectOptionListProducts,
    selectOptionListProductVariants,
} from "../../../../controllers/common/product.controller";
import { listProductReviews } from "../../../../controllers/common/review.controller";
import { tryAuthenticate } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

router.get(
    "/",
    tryAuthenticate,
    listProducts
);

router.get(
    "/:slug",
    tryAuthenticate,
    getProduct
);

router.get("/:slug/reviews", listProductReviews);

router.get("/select-options", selectOptionListProducts);

router.get("/:productSlug/variants/select-options", selectOptionListProductVariants);

export default router;
