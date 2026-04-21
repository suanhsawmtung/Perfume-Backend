import express, { Router } from "express";
import { listPublicProducts, selectOptionListProducts, selectOptionListProductVariants } from "../../../../controllers/common/product.controller";

const router: Router = express.Router();

router.get("/", listPublicProducts);

router.get("/select-options", selectOptionListProducts);

router.get("/:productSlug/variants/select-options", selectOptionListProductVariants);

export default router;
