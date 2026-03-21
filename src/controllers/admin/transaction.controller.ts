import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import * as TransactionService from "../../services/transaction/transaction.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listTransactions = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await TransactionService.listTransactions(req.query);

    return res.status(200).json({
      success: true,
      data: result,
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getTransactionDetail = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      const error = createError({
        message: "Valid Transaction ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const transaction = await TransactionService.getTransactionDetail(id);

    return res.status(200).json({
      success: true,
      data: { transaction },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

export const createTransaction = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const transaction = await TransactionService.createTransaction({
      ...req.body,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: { transaction },
      message: "Transaction created successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateTransaction = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      const error = createError({
        message: "Valid Transaction ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const transaction = await TransactionService.updateTransaction(id, req.body);

    return res.status(200).json({
      success: true,
      data: { transaction },
      message: "Transaction updated successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
