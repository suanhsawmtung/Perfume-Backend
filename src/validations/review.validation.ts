import { body, param } from "express-validator";

export const createReviewValidation = [
    body("productId")
        .notEmpty()
        .withMessage("Product ID is required.")
        .isInt({ min: 1 })
        .withMessage("Product ID must be a positive integer."),
    body("rating")
        .notEmpty()
        .withMessage("Rating is required.")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5."),
    body("content")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Content must be a string."),
];

export const updateReviewValidation = [
    param("id")
        .notEmpty()
        .withMessage("Review ID is required.")
        .isInt({ min: 1 })
        .withMessage("Review ID must be a positive integer."),
    body("rating")
        .notEmpty()
        .withMessage("Rating is required.")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5."),
    body("content")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Content must be a string."),
];

export const deleteReviewValidation = [
    param("id")
        .notEmpty()
        .withMessage("Review ID is required.")
        .isInt({ min: 1 })
        .withMessage("Review ID must be a positive integer."),
];
