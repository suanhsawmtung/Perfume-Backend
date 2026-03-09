import express, { Router } from "express";
import { listPublicProducts } from "../../../../controllers/common/product.controller";

const router: Router = express.Router();

router.get("/", listPublicProducts);

export default router;
