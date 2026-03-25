import { PaymentMethod } from "@prisma/client";
import { body } from "express-validator";

export const createPaymentValidation = [
  body("orderCode")
    .notEmpty()
    .withMessage("Order Code is required.")
    .isString()
    .withMessage("Order Code must be a string."),
  body("method")
    .notEmpty()
    .withMessage("Payment method is required.")
    .isIn(Object.values(PaymentMethod))
    .withMessage(`Method must be one of: ${Object.values(PaymentMethod).join(", ")}.`),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required.")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number."),
  body("reference")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Reference must be at most 255 characters."),
  body("note")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Note must be at most 500 characters."),
  body("paidAt")
    .optional()
    .isISO8601()
    .withMessage("Paid at must be a valid ISO8601 date."),
];

export const updatePaymentValidation = [
  body("reference")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Reference must be at most 255 characters."),
  body("paidAt")
    .optional()
    .isISO8601()
    .withMessage("Paid at must be a valid ISO8601 date."),
  body("method")
    .optional()
    .isIn(Object.values(PaymentMethod))
    .withMessage(`Method must be one of: ${Object.values(PaymentMethod).join(", ")}.`),
  body("note")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Note must be at most 500 characters."),
];

export const verifyPaymentValidation = [
  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["SUCCESS", "FAILED"])
    .withMessage("Status must be one of: SUCCESS, FAILED."),
];
