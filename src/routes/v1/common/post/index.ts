import express, { Router } from "express";
import { getPost, listPosts } from "../../../../controllers/common/post.controller";
import { tryAuthenticate } from "../../../../middlewares/ensure-authenticated";

const router: Router = express.Router();

router.get(
    "/",
    tryAuthenticate,
    listPosts
);

router.get(
    "/:slug",
    tryAuthenticate,
    getPost
);

export default router;