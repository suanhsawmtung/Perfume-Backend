import { Role, Status } from "@prisma/client";

export type ListUsersParams = {
  pageSize: number;
  offset: number;
  authenticatedUserId?: number;
  search?: string | undefined;
  role?: Role | undefined;
  status?: Status | undefined;
};

export type BuildUserWhereParams = Omit<ListUsersParams, "pageSize" | "offset">;

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
