import express, { Router } from "express";
import { listPublicBrands, selectOptionListBrands } from "../../../../controllers/common/brand.controller";

const router: Router = express.Router();

router.get("/", listPublicBrands);

router.get("/select-options", selectOptionListBrands);

export default router;
