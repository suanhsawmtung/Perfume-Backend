import { NextFunction, Response } from "express";
import { AdminUserService } from "../../services/user/admin.service";
import { parseUserQueryParams } from "../../services/user/user.helpers";
import { CustomRequest } from "../../types/common";

const adminUserService = new AdminUserService();

export const listUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseUserQueryParams(req.query);

    const result = await adminUserService.listUsers({
      ...queryParams,
      ...(req.userId ? { authenticatedUserId: req.userId } : {}),
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const result = await adminUserService.getUserDetail(username as string);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const createUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, phone, email, role, status } = req.body;

    const result = await adminUserService.createUser({
      firstName,
      lastName,
      phone,
      email,
      role,
      status,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { firstName, lastName, phone, email, role, status } = req.body;

    const result = await adminUserService.updateUser(username as string, {
      firstName,
      lastName,
      phone,
      email,
      role,
      status,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateUserRole = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { role } = req.body;

    const result = await adminUserService.updateUserRole(username as string, {
      role,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const { status } = req.body;

    const result = await adminUserService.updateUserStatus(username as string, {
      status,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;
    const result = await adminUserService.deleteUser(username as string);
    return res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
