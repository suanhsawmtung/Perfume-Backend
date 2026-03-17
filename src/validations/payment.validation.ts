import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { body } from "express-validator";

export const createPaymentValidation = [
  body("orderId")
    .notEmpty()
    .withMessage("Order ID is required.")
    .isInt()
    .withMessage("Order ID must be an integer."),
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
  body("status")
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Status must be one of: ${Object.values(PaymentStatus).join(", ")}.`),
  body("reference")
    .optional()
    .isString()
    .withMessage("Reference must be a string.")
    .isLength({ max: 255 })
    .withMessage("Reference must be at most 255 characters."),
  body("note")
    .optional()
    .isString()
    .withMessage("Note must be a string.")
    .isLength({ max: 500 })
    .withMessage("Note must be at most 500 characters."),
  body("paidAt")
    .optional()
    .isISO8601()
    .withMessage("Paid at must be a valid ISO8601 date."),
];

export const updatePaymentValidation = [
  body("status")
    .optional()
    .isIn(Object.values(PaymentStatus))
    .withMessage(`Status must be one of: ${Object.values(PaymentStatus).join(", ")}.`),
  body("reference")
    .optional()
    .isString()
    .withMessage("Reference must be a string.")
    .isLength({ max: 255 })
    .withMessage("Reference must be at most 255 characters."),
  body("note")
    .optional()
    .isString()
    .withMessage("Note must be a string.")
    .isLength({ max: 500 })
    .withMessage("Note must be at most 500 characters."),
];
