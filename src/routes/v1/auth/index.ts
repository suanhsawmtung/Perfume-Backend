import express, { Router } from "express";
import passport from "../../../config/passport";
import { forgotPassword, googleCallback, login, logout, register, resendOtp, resetPassword, verifyResetPasswordOtp, verifyUserEmail } from "../../../controllers/auth/auth.controller";
import { ensureUnauthenticated } from "../../../middlewares/ensure-unauthenticated";
import { handleValidationError } from "../../../middlewares/error-handler";
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resendOtpValidation,
  resetPasswordValidation,
  verifyOtpValidation,
  verifyPasswordOtpValidation
} from "../../../validations/auth.validation";

const router: Router = express.Router();

router.post(
  "/register",
  ensureUnauthenticated,
  registerValidation,
  handleValidationError,
  register
);

router.post(
  "/verify-otp",
  ensureUnauthenticated,
  verifyOtpValidation,
  handleValidationError,
  verifyUserEmail
);

router.post(
  "/resend-otp",
  ensureUnauthenticated,
  resendOtpValidation,
  handleValidationError,
  resendOtp
);

router.post(
  "/sign-in",
  ensureUnauthenticated,
  loginValidation,
  handleValidationError,
  login
);

router.post("/logout", logout);

router.post(
  "/forgot-password",
  ensureUnauthenticated,
  forgotPasswordValidation,
  handleValidationError,
  forgotPassword
);

router.post(
  "/verify-password-otp",
  ensureUnauthenticated,
  verifyPasswordOtpValidation,
  handleValidationError,
  verifyResetPasswordOtp
);

router.post(
  "/reset-password",
  ensureUnauthenticated,
  resetPasswordValidation,
  handleValidationError,
  resetPassword
);

// Google OAuth2.0
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
