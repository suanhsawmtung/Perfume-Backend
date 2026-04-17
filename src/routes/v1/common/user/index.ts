import express, { Router } from "express";
import {
  changePassword,
  getMe,
  listPublicUsers,
  setPassword,
  updateMe,
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
  setPasswordValidation,
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
  "/me/change-password",
  normalLimiter,
  isAuthenticated,
  changePasswordValidation,
  handleValidationError,
  changePassword
);

router.patch(
  "/me/set-password",
  normalLimiter,
  isAuthenticated,
  setPasswordValidation,
  handleValidationError,
  setPassword
);



export default router;
