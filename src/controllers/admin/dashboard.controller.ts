import { NextFunction, Response } from "express";
import { parseDashboardQueryParams } from "../../services/dashboard/dashboard.helpers";
import * as dashboardService from "../../services/dashboard/dashboard.service";
import { CustomRequest } from "../../types/common";

export const getDashboardData = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter = parseDashboardQueryParams(req.query);
    const data = await dashboardService.getDashboardData(filter);

    res.status(200).json({
      success: true,
      data,
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};