import { errorCode } from "../../../config/error-code";
import { hash } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import { generateCode } from "../../lib/unique-key-generator";
import { ServiceResponseT } from "../../types/common";
import {
  CreateUserParams,
  ListUserResultT,
  ListUsersParams,
  SafeUserT,
  UpdateUserParams,
  UpdateUserRoleParams,
  UpdateUserStatusParams,
} from "../../types/user";
import { createError } from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";
import {
  buildUserWhere,
  createUserRecord,
  deleteUserRecord,
  findUserByEmail,
  findUserByEmailExcludingId,
  findUserById,
  findUserByUsername,
  generateUsername,
  requireUsername,
  updateUserRecord,
  updateUserRoleRecord,
  updateUserStatusRecord,
  userOmit,
} from "./user.helpers";
import { IAdminUserService } from "./user.interface";

export class AdminUserService implements IAdminUserService {
  async listUsers(
    params: ListUsersParams
  ): Promise<ServiceResponseT<ListUserResultT>> {
    const pageSize = Number(params.limit) || 10;
    const offset = Number(params.offset) || 0;
    const { search, role, status, authenticatedUserId } = params;

    const where = buildUserWhere({
      authenticatedUserId,
      search: typeof search === "string" ? search : undefined,
      role,
      status,
    });

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: pageSize,
        skip: offset,
        orderBy: { createdAt: "desc" },
        omit: userOmit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(offset / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as SafeUserT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async getUserDetail(username: string): Promise<ServiceResponseT<SafeUserT>> {
    const normalizedUsername = requireUsername(username);
    const user = await findUserByUsername(normalizedUsername);

    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: user as SafeUserT,
      message: null,
    };
  }

  async createUser(
    params: CreateUserParams
  ): Promise<ServiceResponseT<SafeUserT>> {
    const { firstName, lastName, phone, email, role, status } = params;

    const trimmedEmail = email.trim().toLowerCase();
    const existingByEmail = await findUserByEmail(trimmedEmail);
    if (existingByEmail) {
      throw createError({
        message: "User with this email already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const username = await generateUsername(firstName, lastName);
    const defaultPassword = "12345678";
    const hashedPassword = await hash(defaultPassword);
    const refreshToken = generateCode(16);

    const user = await createUserRecord({
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      username,
      phone: phone ?? null,
      email: trimmedEmail,
      password: hashedPassword,
      refreshToken,
      emailVerifiedAt: new Date(),
      role,
      status,
    });

    // Manually omit or refetch if createUserRecord doesn't support omit
    const safeUser = await findUserById(user.id);

    return {
      success: true,
      data: safeUser as SafeUserT,
      message: "User created successfully.",
    };
  }

  async updateUser(
    username: string,
    params: UpdateUserParams
  ): Promise<ServiceResponseT<SafeUserT>> {
    const normalizedUsername = requireUsername(username);
    const existing = await findUserByUsername(normalizedUsername);

    if (!existing) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const { firstName, lastName, phone, email, role, status } = params;
    const trimmedEmail = email.trim().toLowerCase();

    const existingByEmail = await findUserByEmailExcludingId(
      trimmedEmail,
      existing.id
    );
    if (existingByEmail) {
      throw createError({
        message: "User with this email already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }

    const newUsername = await generateUsername(firstName, lastName);
    if (newUsername !== existing.username) {
      const existingByUsername = await findUserByUsername(newUsername);
      if (existingByUsername) {
        throw createError({
          message: "User with this username already exists.",
          status: 409,
          code: errorCode.alreadyExists,
        });
      }
    }

    await updateUserRecord(existing.id, {
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      username: newUsername,
      phone: phone ?? null,
      email: trimmedEmail,
      role,
      status,
    });

    const updated = await findUserById(existing.id);

    return {
      success: true,
      data: updated as SafeUserT,
      message: "User updated successfully.",
    };
  }

  async updateUserRole(
    username: string,
    params: UpdateUserRoleParams
  ): Promise<ServiceResponseT<SafeUserT>> {
    const normalizedUsername = requireUsername(username);
    const existing = await findUserByUsername(normalizedUsername);

    if (!existing) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const updated = await updateUserRoleRecord(existing.id, params.role);

    return {
      success: true,
      data: updated as SafeUserT,
      message: "User role updated successfully.",
    };
  }

  async updateUserStatus(
    username: string,
    params: UpdateUserStatusParams
  ): Promise<ServiceResponseT<SafeUserT>> {
    const normalizedUsername = requireUsername(username);
    const existing = await findUserByUsername(normalizedUsername);

    if (!existing) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const updated = await updateUserStatusRecord(existing.id, params.status);

    return {
      success: true,
      data: updated as SafeUserT,
      message: "User status updated successfully.",
    };
  }

  async deleteUser(username: string): Promise<ServiceResponseT<null>> {
    const normalizedUsername = requireUsername(username);
    const existing = await findUserByUsername(normalizedUsername);

    if (!existing) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (existing.image) {
      const imagePath = getFilePath("uploads", "images", "user", existing.image);
      removeFile(imagePath);
    }

    await deleteUserRecord(existing.id);

    return {
      success: true,
      data: null,
      message: "User deleted successfully.",
    };
  }
}
