import { OtpType } from "@prisma/client";
import { body } from "express-validator";

export const registerValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password!")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 12 }),
  body("firstName", "Invalid first name!")
    .trim()
    .notEmpty()
    .escape(),
  body("lastName", "Invalid last name!")
    .trim()
    .notEmpty()
    .escape(),
];

export const verifyOtpValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("otp", "Invalid Otp!")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid token!").trim().notEmpty().escape(),
];

// export const confirmPasswordValidation = [
//   body("email", "Invalid email address!")
//     .trim()
//     .notEmpty()
//     .isEmail()
//     .normalizeEmail(),
//   body("password", "Invalid password!")
//     .trim()
//     .notEmpty()
//     .isLength({ min: 8, max: 12 }),
//   body("token", "Invalid token!").trim().notEmpty().escape(),
// ];

export const loginValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password!")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 12 }),
];

export const forgotPasswordValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
];

export const verifyPasswordOtpValidation = verifyOtpValidation;

export const resetPasswordValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("password", "Invalid password!")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 12 }),
  body("token", "Invalid token!").trim().notEmpty().escape(),
];

export const resendOtpValidation = [
  body("email", "Invalid email address!")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail(),
  body("type", "Invalid OTP type!")
    .trim()
    .notEmpty()
    .isIn(Object.values(OtpType))
];
