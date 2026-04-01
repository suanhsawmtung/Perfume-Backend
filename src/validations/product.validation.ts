import { Concentration, Gender, VariantSource } from "@prisma/client";
import { body } from "express-validator";

// const productValidation = [
//   body("name")
//     .trim()
//     .notEmpty()
//     .withMessage("Name is required.")
//     .isLength({ min: 1, max: 255 })
//     .withMessage("Name must be between 1 and 255 characters."),
//   body("description").trim().notEmpty().withMessage("Description is required."),
//   body("price")
//     .notEmpty()
//     .withMessage("Price is required.")
//     .isFloat({ min: 0 })
//     .withMessage("Price must be a positive number."),
//   body("discount")
//     .optional()
//     .isFloat({ min: 0 })
//     .withMessage("Discount must be a positive number."),
//   body("inventory")
//     .optional()
//     .isInt({ min: 0 })
//     .withMessage("Inventory must be a non-negative integer."),
//   body("status")
//     .optional()
//     .isIn(Object.values(Status))
//     .withMessage("Status must be one of: ACTIVE, INACTIVE, FREEZE."),
//   body("materialId")
//     .notEmpty()
//     .withMessage("Material ID is required.")
//     .isInt({ min: 1 })
//     .withMessage("Material ID must be a positive integer."),
//   body("typeId")
//     .notEmpty()
//     .withMessage("Type ID is required.")
//     .isInt({ min: 1 })
//     .withMessage("Type ID must be a positive integer."),
//   body("brandId")
//     .notEmpty()
//     .withMessage("Brand ID is required.")
//     .isInt({ min: 1 })
//     .withMessage("Brand ID must be a positive integer."),
// ];

// export const createProductValidation = productValidation;

const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1 and 255 characters."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("concentration")
    .notEmpty()
    .withMessage("Concentration is required.")
    .isIn(Object.values(Concentration))
    .withMessage("Concentration is invalid."),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required.")
    .isIn(Object.values(Gender))
    .withMessage("Gender is invalid."),
  body("brandId")
    .notEmpty()
    .withMessage("Brand ID is required.")
    .isInt({ min: 1 })
    .withMessage("Brand ID must be a positive integer."),
  body("isActive")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
  body("isLimited")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isLimited must be a boolean."),
  body("releasedYear")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Released year must be a valid year."),
];

// const updateProductValidation = [
//   ...productValidation,
//   body("imageIds")
//     .optional()
//     .custom((value) => {
//       // Allow array, string (comma-separated), or undefined
//       if (value === undefined || value === null || value === "") {
//         return true;
//       }
//       if (Array.isArray(value)) {
//         return value.every((id) => {
//           const numId = Number(id);
//           return !isNaN(numId) && numId > 0;
//         });
//       }
//       if (typeof value === "string") {
//         const ids = value.split(",").map((id) => Number(id.trim()));
//         return ids.every((id) => !isNaN(id) && id > 0);
//       }
//       return false;
//     })
//     .withMessage(
//       "Image IDs must be an array of positive numbers or a comma-separated string."
//     ),
// ];

export const createProductValidation = productValidation;

const updateProductValidation = [
  ...productValidation,
  body("isActive")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
  body("isLimited")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isLimited must be a boolean."),
  body("releasedYear")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Released year must be a valid year."),
];

export { updateProductValidation };

const productVariantValidation = [
  body("productId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Product ID must be a positive integer."),
  body("size")
    .notEmpty()
    .withMessage("Size is required.")
    .isInt({ min: 1 })
    .withMessage("Size must be a positive integer."),
  body("source")
    .optional()
    .isIn(Object.values(VariantSource))
    .withMessage("Source is invalid."),
  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),
  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount must be a positive number.")
    .custom((value, { req }) => {
      const price = parseFloat(req.body.price);
      if (value !== undefined && value > price) {
        throw new Error("Discount cannot be greater than price.");
      }
      return true;
    }),
  body("isPrimary")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isPrimary must be a boolean."),
  body("isActive")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isActive must be a boolean."),
  body("imageLayout")
    .optional()
    .isArray()
    .withMessage("imageLayout must be an array.")
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.length === 4;
    })
    .withMessage("imageLayout must have exactly 4 slots."),
];

export const createProductVariantValidation = productVariantValidation;

export const updateProductVariantValidation = productVariantValidation;
