import { NextFunction, Response } from "express";
import { errorCode } from "../../../config/error-code";
import * as UserService from "../../services/user/admin.service";
import { parseUserQueryParams } from "../../services/user/user.helpers";
import { CustomRequest } from "../../types/common";
import { createError } from "../../utils/common";

export const listUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryParams = parseUserQueryParams(req.query);

    const {
      items: users,
      currentPage,
      totalPages,
      pageSize,
    } = await UserService.listUsers({
      ...queryParams,
      ...(req.userId ? { authenticatedUserId: req.userId } : {}),
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    });
  } catch (error: any) {
    next(error);
  }
};

// export const getUserById = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       const error = createError({
//         message: "User ID parameter is required.",
//         status: 400,
//         code: errorCode.invalid,
//       });
//       return next(error);
//     }

//     const userId = parseInt(id, 10);
//     const user = await UserService.getUserDetail(userId);

//     res.status(200).json({
//       success: true,
//       data: { user },
//       message: null,
//     });
//   } catch (error: any) {
//     next(error);
//   }
// };

export const getUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const user = await UserService.getUserDetail(username);

    res.status(200).json({
      success: true,
      data: { user },
      message: null,
    });
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

    const user = await UserService.createUser({
      firstName,
      lastName,
      phone,
      email,
      role,
      status,
    });

    res.status(201).json({
      success: true,
      data: { user },
      message: "User created successfully.",
    });
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

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const { firstName, lastName, phone, email, role, status } = req.body;

    const user = await UserService.updateUser(username, {
      firstName,
      lastName,
      phone,
      email,
      role,
      status,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: "User updated successfully.",
    });
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

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const { role } = req.body;

    const user = await UserService.updateUserRole(username, {
      role,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: "User role updated successfully.",
    });
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

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    const { status } = req.body;

    const user = await UserService.updateUserStatus(username, {
      status,
    });

    res.status(200).json({
      success: true,
      data: { user },
      message: "User status updated successfully.",
    });
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

    if (!username) {
      const error = createError({
        message: "Username parameter is required.",
        status: 400,
        code: errorCode.invalid,
      });
      return next(error);
    }

    await UserService.deleteUser(username);

    res.status(200).json({
      success: true,
      data: null,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    next(error);
  }
};
