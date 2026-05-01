import { AuthProvider, Role } from "@prisma/client";
import { Profile } from "passport-google-oauth20";
import { prisma } from "../../lib/prisma";
import { ServiceResponseT } from "../../types/common";
import { PublicUserResultT, PublicUserT, SafeUserT } from "../../types/user";
import { findUserByGoogleId, invalidGoogleProfileError } from "../auth/auth.helpers";
import { createUserRecord, findUserByEmail, generateUsername } from "./user.helpers";
import { IUserService } from "./user.interface";

export class UserService implements IUserService {
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

  async selectOptionListUsers(
    query: { limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<{ 
    items: { id: number; name: string; slug: string; }[], 
    nextCursor: number | null
  }>> {
    const limit = query.limit || 10;
    const cursor = query.cursor;
    const search = query.search;

    const users = await prisma.user.findMany({
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor } }),
      skip: cursor ? 1 : 0,
      where: {
        status: "ACTIVE",
        deletedAt: null,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { username: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
      },
      orderBy: { createdAt: "asc" },
    }); 

    let nextCursor: number | null = null;
  
    if (users.length > limit) {
      users.pop();
      nextCursor = users[users.length - 1]?.id || null;
    }

    const items = users.map(user => ({
      id: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
      slug: user.username,
    }));

    return {
      data: {
        items,
        nextCursor,
      },
      success: true,
      message: null,
    };
  }
}