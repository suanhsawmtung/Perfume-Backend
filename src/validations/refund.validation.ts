import { body } from "express-validator";

export const createRefundValidation = [
  body("orderCode")
    .notEmpty()
    .withMessage("Order code is required.")
    .isString()
    .withMessage("Order code must be a string."),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required.")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number."),
  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string.")
    .isLength({ max: 500 })
    .withMessage("Reason must be at most 500 characters."),
  body("status")
    .optional()
    .isIn(["PENDING", "SUCCESS", "FAILED", "VOIDED"])
    .withMessage("Invalid refund status."),
];

export const updateRefundValidation = [
  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string.")
    .isLength({ max: 500 })
    .withMessage("Reason must be at most 500 characters."),
  body("status")
    .optional()
    .isIn(["PENDING", "SUCCESS", "FAILED", "VOIDED"])
    .withMessage("Invalid refund status."),
];
