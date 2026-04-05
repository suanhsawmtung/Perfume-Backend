import { Role, Status } from "@prisma/client";
import { body } from "express-validator";

const userValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 52 })
    .withMessage("First name must be at most 52 characters."),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 52 })
    .withMessage("Last name must be at most 52 characters."),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage("Phone must be between 1 and 15 characters.")
    .matches("^[0-9]+$")
    .withMessage("Phone must contain only numbers."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email must be at most 255 characters."),
  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}.`),
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(Object.values(Status))
    .withMessage(`Status must be one of: ${Object.values(Status).join(", ")}.`),
];

export const createUserValidation = userValidation;
export const updateUserValidation = userValidation;

export const updateUserRoleValidation = [
  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(Object.values(Role))
    .withMessage(`Role must be one of: ${Object.values(Role).join(", ")}.`),
];

export const updateUserStatusValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(Object.values(Status))
    .withMessage(`Status must be one of: ${Object.values(Status).join(", ")}.`),
];

export const updateMeValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 52 })
    .withMessage("First name must be at most 52 characters."),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 52 })
    .withMessage("Last name must be at most 52 characters."),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage("Phone must be between 1 and 15 characters.")
    .matches("^[0-9]+$")
    .withMessage("Phone must contain only numbers."),
];

export const changePasswordValidation = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required."),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters."),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match password.");
      }
      return true;
    }),
];
