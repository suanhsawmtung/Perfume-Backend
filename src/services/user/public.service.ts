import { AuthProvider, Role } from "@prisma/client";
import { Profile } from "passport-google-oauth20";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { PublicUserResultT, PublicUserT, SafeUserT } from "../../types/user";
import { findUserByGoogleId, invalidGoogleProfileError } from "../auth/auth.helpers";
import { createUserRecord, findUserByEmail, generateUsername } from "./user.helpers";
import { IPublicUserService } from "./user.interface";

export class PublicUserService implements IPublicUserService {
  async listPublicUsers(
    limit?: number,
    offset?: number
  ): Promise<ServiceResponseT<PublicUserResultT>> {
    const pageSize = limit || 10;
    const skip = offset || 0;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          deletedAt: null,
          status: "ACTIVE", // Usually only show active users publicly
        },
        take: pageSize,
        skip,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.user.count({
        where: {
          deletedAt: null,
          status: "ACTIVE",
        },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.floor(skip / pageSize) + 1;

    return {
      success: true,
      data: {
        items: items as PublicUserT[],
        currentPage,
        totalPages,
        pageSize,
      },
      message: null,
    };
  }

  async findOrCreateByGoogle(params: Profile): Promise<ServiceResponseT<SafeUserT>> {
    const email = params.emails?.[0]?.value;
    const googleId = params.id;
    if (!email) throw invalidGoogleProfileError();

    let user = await findUserByGoogleId(googleId);

    if (!user) {
      user = await findUserByEmail(email);
    }

    if (user) {
      return {
        success: true,
        data: user,
        message: "User is already exist."
      };
    }

    const newUser = await createUserRecord({
      email,
      googleId,
      provider: AuthProvider.GOOGLE,
      firstName: params.name?.givenName || params.displayName || "",
      lastName: params.name?.familyName || "",
      role: Role.USER,
      username: await generateUsername(
        params.name?.givenName || params.displayName || `oauth_google_${googleId}`,
        params.name?.familyName || ""
      ),
      emailVerifiedAt: new Date(),
    })

    return {
      success: true,
      data: newUser,
      message: "User created successfully."
    };
  }
}