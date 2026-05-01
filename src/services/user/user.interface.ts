import { Profile } from "passport-google-oauth20";
import { ServiceResponseT } from "../../types/common";
import {
  ChangePasswordParams,
  CreateUserParams,
  ListUserResultT,
  ListUsersParams,
  PublicUserResultT,
  SafeUserT,
  SetPasswordParams,
  UpdateMeParams,
  UpdateUserParams,
  UpdateUserRoleParams,
  UpdateUserStatusParams,
} from "../../types/user";

export interface IAdminUserService {
  listUsers(params: ListUsersParams): Promise<ServiceResponseT<ListUserResultT>>;
  getUserDetail(username: string): Promise<ServiceResponseT<SafeUserT>>;
  createUser(params: CreateUserParams): Promise<ServiceResponseT<SafeUserT>>;
  updateUser(username: string, params: UpdateUserParams): Promise<ServiceResponseT<SafeUserT>>;
  updateUserRole(username: string, params: UpdateUserRoleParams): Promise<ServiceResponseT<SafeUserT>>;
  updateUserStatus(username: string, params: UpdateUserStatusParams): Promise<ServiceResponseT<SafeUserT>>;
  deleteUser(username: string): Promise<ServiceResponseT<null>>;
}

export interface IProfileService {
  getMe(userId: number): Promise<ServiceResponseT<SafeUserT>>;
  updateMe(userId: number, params: UpdateMeParams): Promise<ServiceResponseT<SafeUserT>>;
  changePassword(userId: number, params: ChangePasswordParams): Promise<ServiceResponseT<null>>;
  setPassword(userId: number, params: SetPasswordParams): Promise<ServiceResponseT<null>>;
}

export interface IUserService {
  listPublicUsers(limit?: number, offset?: number): Promise<ServiceResponseT<PublicUserResultT>>;
  findOrCreateByGoogle(params: Profile): Promise<ServiceResponseT<SafeUserT>>;
  selectOptionListUsers(
    query: { limit?: number; cursor?: number | null; search?: string | undefined }
  ): Promise<ServiceResponseT<{ 
    items: { id: number; name: string; slug: string; }[], 
    nextCursor: number | null
  }>>;
}
