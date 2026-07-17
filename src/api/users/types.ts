import type * as Backend from "backend/src/modules/user/index.ts";
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
} from "backend/src/modules/user/index.ts";



export interface ListUsersResponse extends BaseResponse {
  data: {
    items: Backend.UserResponseItem[];
    meta: PaginationMeta;
  };
}

export interface UserDetailResponse extends BaseResponse {
  data: Backend.UserDetailsData;
}

export interface GenericResponse extends BaseResponse {
  data?: any;
}

export interface UserSessionsResponse extends BaseResponse {
  data: Backend.SessionData[];
}

export interface UpdateUserResponse extends BaseResponse {
  data: Required<Backend.UpdateUserResponse>["data"];
}

export interface UpdateUserAvatarResponse extends BaseResponse {
  data: Required<Backend.AvatarUpdateResponse>["data"];
}
