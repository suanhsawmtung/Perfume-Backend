import { TransactionDirection, TransactionType } from "@prisma/client";
import { body } from "express-validator";

export const createTransactionValidation = [
  body("type")
    .notEmpty()
    .withMessage("Transaction type is required.")
    .isIn(Object.values(TransactionType))
    .withMessage(`Type must be one of: ${Object.values(TransactionType).join(", ")}.`),
  body("direction")
    .notEmpty()
    .withMessage("Transaction direction is required.")
    .isIn(Object.values(TransactionDirection))
    .withMessage(`Direction must be one of: ${Object.values(TransactionDirection).join(", ")}.`),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required.")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number."),
  body("source")
    .notEmpty()
    .withMessage("Source is required.")
    .isString()
    .withMessage("Source must be a string.")
    .isLength({ max: 255 })
    .withMessage("Source must be at most 255 characters."),
  body("reference")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Reference must be at most 255 characters."),
  body("note")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Note must be at most 500 characters."),
];

export const updateTransactionValidation = [
  body("source")
    .optional()
    .isString()
    .withMessage("Source must be a string.")
    .isLength({ max: 255 })
    .withMessage("Source must be at most 255 characters."),
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
