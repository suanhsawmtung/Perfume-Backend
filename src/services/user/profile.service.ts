import { OrderStatus } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { UserDto } from "../../dtos/user.dto";
import { compareHashed, hash } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import {
  ChangePasswordParams,
  MyProfileT,
  SafeUserT,
  SetPasswordParams,
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
  updateUserRecord
} from "./user.helpers";
import { IProfileService } from "./user.interface";

export class ProfileService implements IProfileService {
  async getMe(userId: number): Promise<ServiceResponseT<SafeUserT & { hasPassword: boolean }>> {
    const normalizedId = requireUserId(userId);
    const [user, userPassword] = await Promise.all([
      findUserById(normalizedId),
      prisma.user.findUnique({
        where: { id: normalizedId },
        select: { password: true },
      }),
    ]);

    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    return {
      success: true,
      data: { ...user, hasPassword: !!userPassword?.password },
      message: null,
    };
  }

  async getMyProfile(userId: number): Promise<ServiceResponseT<MyProfileT>> {
    const normalizedId = requireUserId(userId);

    const [user, totalOrders, totalSpentResult, totalReviews] = await Promise.all([
      prisma.user.findUnique({
        where: { id: normalizedId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          emailVerifiedAt: true,
          points: true,
          createdAt: true,
          username: true,
          phone: true,
          image: true,
          orders: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              code: true,
              createdAt: true,
              totalPrice: true,
              orderItems: {
                select: {
                  quantity: true,
                },
              },
            },
          },
          wishlists: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  variants: {
                    where: { isPrimary: true },
                    take: 1,
                    select: {
                      price: true,
                      discount: true,
                      images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: {
                          path: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          reviews: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              content: true,
              rating: true,
              isPublish: true,
              createdAt: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({
        where: { userId: normalizedId, status: OrderStatus.DONE, deletedAt: null },
      }),
      prisma.order.aggregate({
        where: { userId: normalizedId, status: OrderStatus.DONE, deletedAt: null },
        _sum: { totalPrice: true },
      }),
      prisma.review.count({
        where: { userId: normalizedId },
      }),
    ]);

    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    const data = UserDto.toMyProfile(user, {
      totalOrders,
      totalSpent: Number(totalSpentResult._sum.totalPrice || 0),
      totalReviews,
    });

    return {
      success: true,
      data,
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

    const updated = await findUserById(existing.id);

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

    const isMatch = await compareHashed(oldPassword, user.password || "");
    if (!user.password || !isMatch) {
      throw createError({
        message: !user.password 
          ? "You do not have a password yet. Please use the Set Password feature." 
          : "Current password does not match.",
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

  async setPassword(
    userId: number,
    params: SetPasswordParams
  ): Promise<ServiceResponseT<null>> {
    const { newPassword } = params;
    const normalizedId = requireUserId(userId);

    const user = await findUserByIdWithSensitive(normalizedId);
    if (!user) {
      throw createError({
        message: "User not found.",
        status: 404,
        code: errorCode.notFound,
      });
    }

    if (user.password) {
      throw createError({
        message: "You already have a password. Please use the Change Password feature.",
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
      message: "Password set successfully.",
    };
  }
}
