import type {
  UserResponseItem,
  CreateUserParams,
  UpdateUserParams,
  UserDetailsData,
  ListUsersParams,
  BanUserParams,
  SessionData,
  ChangePasswordParams,
  UserProfileData,
} from "backend/src/modules/user/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  UserResponseItem,
  CreateUserParams,
  UpdateUserParams,
  UserDetailsData,
  ListUsersParams,
  BanUserParams,
  SessionData,
  ChangePasswordParams,
  UserProfileData,
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


