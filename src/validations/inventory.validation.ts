import { InventoryType } from "@prisma/client";
import { body, param } from "express-validator";

export const createInventoryValidation = [
  body("productVariantId")
    .notEmpty()
    .withMessage("Product variant ID is required.")
    .isInt()
    .withMessage("Product variant ID must be an integer."),
  body("type")
    .notEmpty()
    .withMessage("Inventory type is required.")
    .isIn(Object.values(InventoryType))
    .withMessage(`Inventory type must be one of: ${Object.values(InventoryType).join(", ")}.`),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required.")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer."),
  body("unitCost")
    .optional()
    .isNumeric()
    .withMessage("Unit cost must be a number."),
];

export const listInventoriesValidation = [
  param("type")
    .notEmpty()
    .withMessage("Inventory type is required.")
    .isIn(Object.values(InventoryType))
    .withMessage(`Inventory type must be one of: ${Object.values(InventoryType).join(", ")}.`),
];