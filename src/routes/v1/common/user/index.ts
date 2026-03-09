import express, { Router } from "express";
import { listPublicUsers } from "../../../../controllers/common/user.controller";

const router: Router = express.Router();

router.get("/", listPublicUsers);

export default router;
