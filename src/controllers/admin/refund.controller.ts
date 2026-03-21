import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import * as RefundService from "../../services/refund/refund.service";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listRefunds = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await RefundService.listRefunds(req.query);

    return res.status(200).json({
      success: true,
      data: result,
      message: null,
    });
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
      const error = createError({
        message: "Valid Refund ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const refund = await RefundService.getRefundDetail(id);

    return res.status(200).json({
      success: true,
      data: { refund },
      message: null,
    });
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
    const refund = await RefundService.createRefund(req.body);

    return res.status(201).json({
      success: true,
      data: { refund },
      message: "Refund created successfully.",
    });
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
      const error = createError({
        message: "Valid Refund ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const refund = await RefundService.updateRefund(id, req.body);

    return res.status(200).json({
      success: true,
      data: { refund },
      message: "Refund updated successfully.",
    });
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
      const error = createError({
        message: "Valid Refund ID is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await RefundService.voidRefund(id);

    return res.status(200).json({
      success: true,
      data: null,
      message: "Refund voided successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
