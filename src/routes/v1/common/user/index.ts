import express, { Router } from "express";
import {
  getMe,
  listPublicUsers,
  updateMe,
  changePassword,
} from "../../../../controllers/common/user.controller";
import { isAuthenticated } from "../../../../middlewares/ensure-authenticated";
import { handleValidationError } from "../../../../middlewares/error-handler";
import {
  handleMulterError,
  uploadProfileImage,
} from "../../../../middlewares/file-upload";
import { normalLimiter } from "../../../../middlewares/rate-limiter";
import {
  changePasswordValidation,
  updateMeValidation,
} from "../../../../validations/user.validation";

const router: Router = express.Router();

router.get("/", listPublicUsers);

router.get(
  "/me",
  normalLimiter,
  isAuthenticated,
  getMe
);

router.patch(
  "/me",
  normalLimiter,
  isAuthenticated,
  uploadProfileImage,
  handleMulterError,
  updateMeValidation,
  handleValidationError,
  updateMe
);

router.patch(
  "/me/password",
  normalLimiter,
  isAuthenticated,
  changePasswordValidation,
  handleValidationError,
  changePassword
);



export default router;
