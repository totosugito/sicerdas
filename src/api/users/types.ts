import type {
  UserResponseItem,
  CreateUserParams,
  UpdateUserParams,
  UserDetailsData,
  ListUsersParams,
  BanUserBody,
  SessionData,
  ChangePasswordBody,
  RevokeSessionBody,
  UserProfileData,
  BaseUpdateProfileData,
} from "backend/src/modules/users/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  UserResponseItem,
  CreateUserParams,
  UpdateUserParams,
  UserDetailsData,
  ListUsersParams,
  BanUserBody,
  SessionData,
  ChangePasswordBody,
  RevokeSessionBody,
  UserProfileData,
  BaseUpdateProfileData,
  BaseResponse,
  PaginationMeta,
};

export interface UserResponse<T = UserResponseItem> extends BaseResponse {
  data: T;
}

export type UserDetailResponse = UserResponse<UserDetailsData>;

export interface ListUsersResponse extends BaseResponse {
  data: {
    items: UserResponseItem[];
    meta: PaginationMeta;
  };
}

export interface UserSessionsResponse extends BaseResponse {
  data: SessionData[];
}


