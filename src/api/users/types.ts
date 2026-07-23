import type {
  UserResponseItem,
  CreateUserParams,
  UpdateUserParams,
  UserDetailsData,
  ListUsersBody,
  ListUsersResponse,
  BanUserBody,
  SessionData,
  ChangePasswordBody,
  RevokeSessionBody,
  UserProfileData,
  BaseUpdateProfileData,
  BulkDeleteUsersBody,
  ResetPasswordBody,
} from "backend/src/modules/users/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  UserResponseItem,
  CreateUserParams,
  UpdateUserParams,
  UserDetailsData,
  ListUsersBody,
  ListUsersResponse,
  BanUserBody,
  SessionData,
  ChangePasswordBody,
  RevokeSessionBody,
  UserProfileData,
  BaseUpdateProfileData,
  BulkDeleteUsersBody,
  ResetPasswordBody,
  BaseResponse,
  PaginationMeta,
};

export interface UserResponse<T = UserResponseItem> extends BaseResponse {
  data: T;
}

export type UserDetailResponse = UserResponse<UserDetailsData>;

export interface UserSessionsResponse extends BaseResponse {
  data: SessionData[];
}


