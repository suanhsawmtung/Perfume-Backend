import { Prisma, Role, Status } from "@prisma/client";
import { errorCode } from "../../config/error-code";
import { prisma } from "../../lib/prisma";
import { generateCode } from "../../lib/unique-key-generator";
import {
    BuildUserWhereParams,
    ParseUserQueryParamsResult,
} from "../../types/user";
import { createError, createSlug } from "../../utils/common";

export const userOmit = {
  password: true,
  refreshToken: true,
  previousRefreshToken: true,
  googleId: true,
  rotateTokenAt: true,
  deletedAt: true,
} as const;

export const parseUserQueryParams = (
  query: any
): ParseUserQueryParamsResult => {
  const pageSizeParam = Number(query.limit);
  const pageSize =
    Number.isNaN(pageSizeParam) || pageSizeParam <= 0
      ? 10
      : Math.min(pageSizeParam, 50);

  const offsetParam = Number(query.offset);
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  const search =
    typeof query.search === "string" && query.search.trim().length > 0
      ? query.search.trim()
      : undefined;

  let role: Role | undefined;
  if (typeof query.role === "string") {
    const roleValue = query.role.toUpperCase();
    if (Object.values(Role).includes(roleValue as Role)) {
      role = roleValue as Role;
    }
  }

  let status: Status | undefined;
  if (typeof query.status === "string") {
    const statusValue = query.status.toUpperCase();
    if (Object.values(Status).includes(statusValue as Status)) {
      status = statusValue as Status;
    }
  }

  return {
    pageSize,
    offset,
    search,
    role,
    status,
  };
};

export const buildUserWhere = ({
  authenticatedUserId,
  search,
  role,
  status,
}: BuildUserWhereParams): Prisma.UserWhereInput => {
  const whereConditions: Prisma.UserWhereInput[] = [{ deletedAt: null }];

  if (authenticatedUserId) {
    whereConditions.push({ id: { not: authenticatedUserId } });
  }

  if (search) {
    whereConditions.push({
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (role) {
    whereConditions.push({ role });
  }

  if (status) {
    whereConditions.push({ status });
  }

  return whereConditions.length > 0
    ? {
        AND: whereConditions,
      }
    : {};
};

export const requireUserId = (id: number) => {
  if (isNaN(id) || id <= 0) {
    throw createError({
      message: "Invalid user ID.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return id;
};

export const requireUsername = (username: string) => {
  if (!username || !username.trim()) {
    throw createError({
      message: "Username parameter is required.",
      status: 400,
      code: errorCode.invalid,
    });
  }

  return username.trim();
};

export const findUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
    omit: userOmit,
  });
};

export const findUserByIdWithSensitive = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const findUsernameByUserId = async (id: number) => {
  return (
    await prisma.user.findUnique({
      where: { id },
      select: { username: true },
    })
  )?.username;
};

export const findUserRoleById = async (id: number) => {
  return (
    await prisma.user.findUnique({
      where: { id },
      select: {
        role: true,
      },
    })
  )?.role;
};

export const getRoleOrThrow = async (authenticatedUserId: number) => {
  const role = await findUserRoleById(authenticatedUserId);
  if (!role) {
    throw createError({
      message: "User not found.",
      status: 404,
      code: errorCode.notFound,
    });
  }

  return role;
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
    omit: userOmit,
  });
};

export const findUserByEmailWithSensitive = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findUserByUsername = async (username: string) => {
  return await prisma.user.findUnique({
    where: { username },
    omit: userOmit,
  });
};

export const findUserByEmailExcludingId = async (
  email: string,
  excludeId: number
) => {
  return await prisma.user.findFirst({
    where: {
      email,
      NOT: { id: excludeId },
    },
  });
};

export const findUserByUsernameExcludingId = async (
  username: string,
  excludeId: number
) => {
  return await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: excludeId },
    },
  });
};

export const createUserRecord = async (createUserData: Prisma.UserCreateInput) => {
  return await prisma.user.create({
    data: createUserData,
    omit: userOmit,
  });
};

export const updateUserRecord = async (
  id: number,
  updateUserData: Prisma.UserUpdateInput
) => {
  return await prisma.user.update({
    where: { id },
    data: updateUserData,
    omit: userOmit,
  });
};

export const updateUserRoleRecord = async (id: number, role: Role) => {
  return await prisma.user.update({
    where: { id },
    data: { role },
    omit: userOmit,
  });
};

export const updateUserStatusRecord = async (id: number, status: Status) => {
  return await prisma.user.update({
    where: { id },
    data: { status },
    omit: userOmit,
  });
};

export const deleteUserRecord = async (id: number) => {
  return await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
    omit: userOmit,
  });
};

export const generateUsername = async (
  firstName: string | null | undefined,
  lastName: string | null | undefined
): Promise<string> => {
  let baseSlug: string;

  if (firstName && lastName) {
    baseSlug = createSlug(`${firstName} ${lastName}`);
  } else if (firstName) {
    baseSlug = createSlug(firstName);
  } else if (lastName) {
    baseSlug = createSlug(lastName);
  } else {
    baseSlug = generateCode(8);
  }

  let username = baseSlug;
  let existingUser = await findUserByUsername(username);
  let attempts = 0;
  const maxAttempts = 10;

  while (existingUser && attempts < maxAttempts) {
    const randomCode = generateCode(2);
    username = `${baseSlug}-${randomCode}`;
    existingUser = await findUserByUsername(username);
    attempts++;
  }

  if (existingUser) {
    const timestamp = Date.now().toString(36);
    username = `${baseSlug}-${timestamp}`;
  }

  return username;
};
