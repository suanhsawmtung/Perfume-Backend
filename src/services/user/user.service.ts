import { errorCode } from "../../../config/error-code";
import { hash } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import { generateCode } from "../../lib/unique-key-generator";
import {
    CreateUserParams,
    ListUsersParams,
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
    findUserByUsername,
    generateUsername,
    requireUsername,
    updateUserRecord,
    updateUserRoleRecord,
    updateUserStatusRecord,
} from "./user.helpers";

export const listPublicUsers = async (limit?: number, cursor?: number) => {
  return await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    ...(limit ? { take: limit } : {}),
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
    },
    orderBy: { id: "asc" },
  });
};

export const listUsers = async ({
  pageSize,
  offset,
  authenticatedUserId,
  search,
  role,
  status,
}: ListUsersParams) => {
  const where = buildUserWhere({
    ...(authenticatedUserId ? { authenticatedUserId } : {}),
    ...(search ? { search } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  });

  const total = await prisma.user.count({ where });
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const items = await prisma.user.findMany({
    where,
    take: pageSize,
    skip: offset,
    orderBy: { id: "desc" },
    omit: {
      password: true,
      randToken: true,
      errorLoginCount: true,
    },
  });

  return {
    items,
    currentPage,
    totalPages,
    pageSize,
  };
};

export const getUserDetail = async (username: string) => {
  const normalizedUsername = requireUsername(username);
  const user = await findUserByUsername(normalizedUsername);

  if (!user) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return user;
};

export const createUser = async (params: CreateUserParams) => {
  const { firstName, lastName, phone, email, role, status } = params;

  if (!email || !email.trim()) {
    throw createError({
      message: "Email is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone ? phone.trim() : null;
  const trimmedFirstName = firstName ? firstName.trim() : null;
  const trimmedLastName = lastName ? lastName.trim() : null;

  const existingByEmail = await findUserByEmail(trimmedEmail);
  if (existingByEmail) {
    throw createError({
      message: "User with this email already exists.",
      status: 409,
      code: errorCode.alreadyExists,
    });
  }

  const username = await generateUsername(trimmedFirstName, trimmedLastName);
  const defaultPassword = "12345678";
  const hashedPassword = await hash(defaultPassword);
  const randToken = generateCode(16);

  const user = await createUserRecord({
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    username,
    phone: trimmedPhone,
    email: trimmedEmail,
    password: hashedPassword,
    randToken,
    role,
    status,
  });

  return user;
};

export const updateUser = async (username: string, params: UpdateUserParams) => {
  const { firstName, lastName, phone, email, role, status } = params;

  const normalizedUsername = requireUsername(username);
  const existing = await findUserByUsername(normalizedUsername);
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  if (!email || !email.trim()) {
    throw createError({
      message: "Email is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone ? phone.trim() : null;
  const trimmedFirstName = firstName ? firstName.trim() : null;
  const trimmedLastName = lastName ? lastName.trim() : null;

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

  const newUsername = await generateUsername(trimmedFirstName, trimmedLastName);

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

  const user = await updateUserRecord(existing.id, {
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    username: newUsername,
    phone: trimmedPhone,
    email: trimmedEmail,
    role,
    status,
  });

  return user;
};

export const updateUserRole = async (
  username: string,
  params: UpdateUserRoleParams
) => {
  const { role } = params;
  const normalizedUsername = requireUsername(username);

  const existing = await findUserByUsername(normalizedUsername);
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const user = await updateUserRoleRecord(existing.id, role);

  return user;
};

export const updateUserStatus = async (
  username: string,
  params: UpdateUserStatusParams
) => {
  const { status } = params;
  const normalizedUsername = requireUsername(username);

  const existing = await findUserByUsername(normalizedUsername);
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const user = await updateUserStatusRecord(existing.id, status);

  return user;
};

export const deleteUser = async (username: string) => {
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
};
