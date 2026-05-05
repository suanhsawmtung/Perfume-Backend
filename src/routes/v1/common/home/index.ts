import express, { Router } from "express";
import { getHome } from "../../../../controllers/common/home.controller";
import { tryAuthenticate } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

router.get(
    "/",
    tryAuthenticate,
    getHome
);

export default router;
