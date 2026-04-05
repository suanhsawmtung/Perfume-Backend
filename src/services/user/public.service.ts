import { Prisma } from "@prisma/client";
import { errorCode } from "../../../config/error-code";
import { compareHashed, hash } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import {
  ChangePasswordParams,
  UpdateMeParams
} from "../../types/user";
import { createError } from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";
import {
  findUserById,
  findUserByIdWithSensitive,
  findUserByUsernameExcludingId,
  generateUsername,
  requireUserId,
  updateUserRecord
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

export const getMe = async (userId: number) => {
  const normalizedId = requireUserId(userId);
  const user = await findUserById(normalizedId);

  if (!user) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return user;
};

export const updateMe = async (userId: number, params: UpdateMeParams) => {
  const { firstName, lastName, phone, imageFilename } = params;
  const normalizedId = requireUserId(userId);

  const existing = await findUserById(normalizedId);
  if (!existing) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const trimmedFirstName = firstName?.trim() || null;
  const trimmedLastName = lastName?.trim() || null;
  const trimmedPhone = phone?.trim() || null;

  // New username if name changed
  const newUsername = await generateUsername(trimmedFirstName, trimmedLastName);

  if (newUsername !== existing.username) {
    const existingByUsername = await findUserByUsernameExcludingId(newUsername, existing.id);
    if (existingByUsername) {
      throw createError({
        message: "User with this username already exists.",
        status: 409,
        code: errorCode.alreadyExists,
      });
    }
  }

  const updateData: Prisma.UserUpdateInput = {
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    username: newUsername,
    phone: trimmedPhone,
  };

  if (imageFilename) {
    if (existing.image) {
      const oldImagePath = getFilePath("uploads", "images", "user", existing.image);
      removeFile(oldImagePath);
    }
    updateData.image = imageFilename;
  }

  return await updateUserRecord(existing.id, updateData);
};

export const changePassword = async (userId: number, params: ChangePasswordParams) => {
  const { oldPassword, newPassword } = params;
  const normalizedId = requireUserId(userId);

  const user = await findUserByIdWithSensitive(normalizedId);
  if (!user) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  const isMatch = await compareHashed(oldPassword, user.password);
  if (!isMatch) {
    throw createError({
      message: "Current password does not match.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  const hashedPassword = await hash(newPassword);
  await updateUserRecord(user.id, {
    password: hashedPassword,
  });
};