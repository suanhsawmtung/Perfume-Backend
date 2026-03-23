import { OrderItemType, OrderStatus } from "@prisma/client";
import { body } from "express-validator";

const orderValidation = [
  body("status")
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage(
      `Status must be one of: ${Object.values(OrderStatus).join(", ")}.`
    ),
  body("customerName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Customer name must be at most 100 characters."),
  body("customerPhone")
    .optional()
    .trim()
    .isLength({ max: 15 })
    .withMessage("Customer phone must be at most 15 characters."),
  body("customerAddress")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Customer address must be at most 255 characters."),
  body("customerNotes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Customer notes must be at most 500 characters."),
  body("rejectedReason")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Rejected reason must be at most 255 characters."),
  body("items")
    .isArray({ min: 1 })
    .withMessage(
      "Order items array is required and must contain at least one item."
    )
    .custom((items) => {
      if (!Array.isArray(items)) {
        return false;
      }
      return items.every((item: any) => {
        return (
          typeof item.itemId === "number" &&
          item.itemId > 0 &&
          typeof item.quantity === "number" &&
          item.quantity > 0 &&
          typeof item.price === "number" &&
          item.price >= 0 &&
          Object.values(OrderItemType).includes(item.itemType)
        );
      });
    })
    .withMessage(
      "Each item must have itemId (positive integer), quantity (positive integer), and price (non-negative number)."
    ),
];

export const createOrderValidation = orderValidation;

const updateOrderValidation = [
  ...orderValidation,
  body("userId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer."),
];

export { updateOrderValidation };

