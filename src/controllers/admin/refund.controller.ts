import { NextFunction, Response } from "express";
import { errorCode } from "../../config/error-code";
import { AdminRefundService } from "../../services/refund/admin.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

const adminRefundService = new AdminRefundService();

export const listRefunds = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminRefundService.listRefunds(req.query);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getRefundDetail = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw createError({
        message: "Valid Refund ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminRefundService.getRefundDetail(id);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createRefund = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminRefundService.createRefund(req.body);
    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateRefund = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw createError({
        message: "Valid Refund ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminRefundService.updateRefund(id, req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const voidRefund = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw createError({
        message: "Valid Refund ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
    }

    const result = await adminRefundService.deleteRefund(id);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
