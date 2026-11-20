import type { BaseResponse, EnumStatsPeriodType, PaginationMeta } from "@/api/types";

export const EnumUserRole = {
  ADMIN: "admin",
  TEACHER: "teacher",
  USER: "user",
  GUEST: "guest",
} as const;
export type EnumUserRole = (typeof EnumUserRole)[keyof typeof EnumUserRole];

export interface UserResponseItem {
  id: string;
  email: string;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: EnumUserRole;
  banned: boolean;
  banReason: string | null;
}

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  school: string | null;
  educationLevel: string | null;
  grade: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  providerId: string;
  extra: Record<string, unknown>;
}

export interface UserDetailsData extends UserProfileData {
  role: EnumUserRole;
  banned: boolean;
  banReason: string | null;
  banExpires: string | null;
}

export interface BaseUpdateProfileData {
  name?: string;
  school?: string;
  educationLevel?: string;
  grade?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  extra?: unknown;
}

export interface CreateUserParams {
  name: string;
  email: string;
  role?: EnumUserRole;
  password: string;
}

export interface UpdateUserParams {
  id: string;
  name?: string;
  email?: string;
  role?: EnumUserRole;
}

export interface ListUsersBody {
  page?: number;
  limit?: number;
  search?: string;
  roles?: EnumUserRole[];
  sortBy?: string;
  sortOrder?: string;
}

export interface ListUsersResponse extends BaseResponse {
  data: {
    items: UserResponseItem[];
    meta: PaginationMeta;
  };
}

export interface BanUserBody {
  id: string;
  banned: boolean;
  banReason?: string;
}

export interface SessionData {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  token: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface RevokeSessionBody {
  sessionToken: string;
}

export interface BulkDeleteUsersBody {
  ids: string[];
}

export interface ResetPasswordBody {
  id: string;
  newPassword: string;
}

export interface GetUserStatsQuery {
  periodType?: EnumStatsPeriodType;
  limit?: number;
}

export interface UserStatsItem {
  id: string;
  periodType: string;
  periodKey: string;
  date: string;
  newUsersCount: number;
  totalUsersCount: number;
  activeUsersCount: number;
  bannedUsersCount: number;
  roleBreakdown: Record<string, number>;
  tierBreakdown: Record<string, number>;
  educationBreakdown: Record<string, number>;
  createdAt: string;
}

export interface UserStatsData {
  kpi: {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    roleBreakdown: Record<string, number>;
    tierBreakdown: Record<string, number>;
  };
  history: UserStatsItem[];
}

export interface GetUserStatsResponse extends BaseResponse {
  data: UserStatsData;
}

export type { BaseResponse, PaginationMeta };

export interface UserResponse<T = UserResponseItem> extends BaseResponse {
  data: T;
}

export type UserDetailResponse = UserResponse<UserDetailsData>;

export interface UserSessionsResponse extends BaseResponse {
  data: SessionData[];
}
