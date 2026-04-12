import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import { AdminTransactionService } from "../../services/transaction/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminTransactionService = new AdminTransactionService();

export const listTransactions = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminTransactionService.listTransactions(req.query);
    return res.status(200).json(result);
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
      throw createError({
        message: "Valid Transaction ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminTransactionService.getTransactionDetail(id);
    return res.status(200).json(result);
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
    const result = await adminTransactionService.createTransaction({
      ...req.body,
      userId,
    });
    return res.status(201).json(result);
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
      throw createError({
        message: "Valid Transaction ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminTransactionService.updateTransaction(id, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
