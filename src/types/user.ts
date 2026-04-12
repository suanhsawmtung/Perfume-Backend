import { Role, Status, User } from "@prisma/client";

export type SafeUserT = Omit<User, "password" | "randToken" | "previousRandToken">;

export type ListUsersParams = {
  limit?: number | string | undefined;
  offset?: number | string | undefined;
  authenticatedUserId?: number | undefined;
  search?: string | undefined;
  role?: Role | undefined;
  status?: Status | undefined;
};

export type BuildUserWhereParams = Omit<ListUsersParams, "limit" | "offset">;

export type CreateUserParams = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  role: Role;
  status: Status;
};

export type UpdateUserParams = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email: string;
  role: Role;
  status: Status;
};

export type UpdateUserRoleParams = {
  role: Role;
};

export type UpdateUserStatusParams = {
  status: Status;
};

export type UpdateMeParams = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  imageFilename?: string | undefined;
};

export type ChangePasswordParams = {
  oldPassword: string;
  newPassword: string;
};

export type ParseUserQueryParamsResult = {
  pageSize: number;
  offset: number;
  search?: string | undefined;
  role?: Role | undefined;
  status?: Status | undefined;
};

export type ListUserResultT = {
  items: SafeUserT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

export type PublicUserT = Pick<User, "id" | "firstName" | "lastName" | "username">;

export type PublicUserResultT = {
  items: PublicUserT[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
};
