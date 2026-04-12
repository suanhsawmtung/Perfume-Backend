import { errorCode } from "../../../config/error-code";
import { compareHashed, hash } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  ChangePasswordParams,
  SafeUserT,
  UpdateMeParams,
} from "../../types/user";
import { createError } from "../../utils/common";
import { getFilePath, removeFile } from "../../utils/file";
import {
  findUserById,
  findUserByIdWithSensitive,
  findUserByUsernameExcludingId,
  generateUsername,
  requireUserId,
  updateUserRecord,
} from "./user.helpers";
import { IProfileService } from "./user.interface";

const userOmit = {
  password: true,
  randToken: true,
  errorLoginCount: true,
  previousRandToken: true,
} as const;

export class ProfileService implements IProfileService {
  async getMe(userId: number): Promise<ServiceResponseT<SafeUserT>> {
    const normalizedId = requireUserId(userId);
    const user = await findUserById(normalizedId);

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

  async updateMe(
    userId: number,
    params: UpdateMeParams
  ): Promise<ServiceResponseT<SafeUserT>> {
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

    // New username if name changed
    const newUsername = await generateUsername(firstName || null, lastName || null);

    if (newUsername !== existing.username) {
      const existingByUsername = await findUserByUsernameExcludingId(
        newUsername,
        existing.id
      );
      if (existingByUsername) {
        throw createError({
          message: "User with this username already exists.",
          status: 409,
          code: errorCode.alreadyExists,
        });
      }
    }

    const updateData: any = {
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      username: newUsername,
      phone: phone ?? null,
    };

    if (imageFilename) {
      if (existing.image) {
        const oldImagePath = getFilePath("uploads", "images", "user", existing.image);
        removeFile(oldImagePath);
      }
      updateData.image = imageFilename;
    }

    await updateUserRecord(existing.id, updateData);

    const updated = await prisma.user.findUnique({
      where: { id: existing.id },
      omit: userOmit,
    });

    return {
      success: true,
      data: updated as SafeUserT,
      message: "Profile updated successfully.",
    };
  }

  async changePassword(
    userId: number,
    params: ChangePasswordParams
  ): Promise<ServiceResponseT<null>> {
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

    return {
      success: true,
      data: null,
      message: "Password changed successfully.",
    };
  }
}
