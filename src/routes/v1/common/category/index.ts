import express, { Router } from "express";
import { listPublicCategories, selectOptionListCategories } from "../../../../controllers/common/category.controller";

const router: Router = express.Router();

router.get("/", listPublicCategories);

router.get("/select-options", selectOptionListCategories);

export default router;
