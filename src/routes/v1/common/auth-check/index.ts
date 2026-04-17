import express, { Router } from "express";
import { checkAuth } from "../../../../controllers/auth/auth.controller";
import { handleAuthCheckError } from "../../../../middlewares/error-handler";

const router: Router = express.Router();

router.get("/", handleAuthCheckError, checkAuth);

export default router;
