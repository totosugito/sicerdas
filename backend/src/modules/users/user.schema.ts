import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../types/response.ts";
import { EnumUserRole, EnumStatsPeriodType } from "../../db/schema/index.ts";

export const UserCoreSchema = Type.Object({

  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.String(),
  image: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const UserAdminFieldsSchema = Type.Object({
  role: Type.Enum(EnumUserRole),
  banned: Type.Boolean(),
  banReason: Type.Union([Type.String(), Type.Null()]),
});

export const UserResponseItemSchema = Type.Composite([
  UserCoreSchema,
  UserAdminFieldsSchema,
]);

export const UserResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: UserResponseItemSchema,
  }),
]);

export const UserProfileExtraFieldsSchema = Type.Object({
  emailVerified: Type.Boolean(),
  school: Type.Union([Type.String(), Type.Null()]),
  educationLevel: Type.Union([Type.String(), Type.Null()]),
  grade: Type.Union([Type.String(), Type.Null()]),
  phone: Type.Union([Type.String(), Type.Null()]),
  address: Type.Union([Type.String(), Type.Null()]),
  bio: Type.Union([Type.String(), Type.Null()]),
  dateOfBirth: Type.Union([Type.String(), Type.Null()]),
  providerId: Type.String(),
  extra: Type.Object({}, { additionalProperties: true }),
});

export const UserProfileDataSchema = Type.Composite([
  UserCoreSchema,
  UserProfileExtraFieldsSchema,
]);

export const UserDetailsResponseItemSchema = Type.Composite([
  UserCoreSchema,
  UserProfileExtraFieldsSchema,
  UserAdminFieldsSchema,
  Type.Object({
    banExpires: Type.Union([Type.String(), Type.Null()]),
  }),
]);

export const UserDetailsResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: UserDetailsResponseItemSchema,
  }),
]);

export const UpdateProfileResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: UserProfileDataSchema,
  }),
]);

export interface BaseUpdateProfileData {
  name?: string;
  school?: string;
  educationLevel?: string;
  grade?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  extra?: any;
}

const UserBaseFields = {
  name: Type.String({ description: "The full name of the user" }),
  email: Type.String({ format: "email", description: "Unique email address" }),
  role: Type.Enum(EnumUserRole, { description: "Role of the user" }),
};

export const CreateUserBodySchema = Type.Object({
  name: UserBaseFields.name,
  email: UserBaseFields.email,
  role: Type.Optional(Type.Enum(EnumUserRole, { default: EnumUserRole.USER, description: "Role of the user" })),
  password: Type.String({ minLength: 6, description: "Initial password for the user" }),
});

export const UpdateUserBodySchema = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to update" }),
  name: Type.Optional(UserBaseFields.name),
  email: Type.Optional(UserBaseFields.email),
  role: Type.Optional(UserBaseFields.role),
});

export type UserResponseItem = Static<typeof UserResponseItemSchema>;
export type UserDetailsData = Static<typeof UserDetailsResponseItemSchema>;
export type UserProfileData = Static<typeof UserProfileDataSchema>;

export const AvatarResponseItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  name: Type.String(),
  image: Type.Union([Type.String(), Type.Null()]),
});

export const AvatarResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: AvatarResponseItemSchema,
  }),
]);

export type AvatarResponseData = Static<typeof AvatarResponseItemSchema>;

export const SessionItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  expiresAt: Type.String({ format: "date-time" }),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  ipAddress: Type.Union([Type.String(), Type.Null()]),
  userAgent: Type.Union([Type.String(), Type.Null()]),
  token: Type.String(),
});

export const SessionListResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(SessionItemSchema),
  }),
]);

export type SessionData = Static<typeof SessionItemSchema>;

export const ChangePasswordBodySchema = Type.Object({
  currentPassword: Type.String({
    description: "Current password",
    minLength: 1,
  }),
  newPassword: Type.String({
    description: "New password",
    minLength: 6,
  }),
});

export type ChangePasswordBody = Static<typeof ChangePasswordBodySchema>;

export const RevokeSessionBodySchema = Type.Object({
  sessionToken: Type.String({ description: "The token of the session to revoke" }),
});

export type RevokeSessionBody = Static<typeof RevokeSessionBodySchema>;

export const BanUserBodySchema = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to ban/unban" }),
  banned: Type.Boolean({ description: "True to ban, false to unban" }),
  banReason: Type.Optional(Type.String({ description: "Reason for the ban" })),
});

export type BanUserBody = Static<typeof BanUserBodySchema>;

export const UserIdParamSchema = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID" }),
});

export type UserIdParam = Static<typeof UserIdParamSchema>;

export const BulkDeleteUsersBodySchema = Type.Object({
  ids: Type.Array(Type.String({ format: "uuid" }), {
    minItems: 1,
    description: "List of User IDs to delete",
  }),
});

export type BulkDeleteUsersBody = Static<typeof BulkDeleteUsersBodySchema>;

export const ResetPasswordBodySchema = Type.Object({
  id: Type.String({ format: "uuid", description: "User ID to reset password" }),
  newPassword: Type.String({ minLength: 6, description: "New password" }),
});

export type ResetPasswordBody = Static<typeof ResetPasswordBodySchema>;

export const ListUsersBodySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
  search: Type.Optional(Type.String({ description: "Search term for name or email" })),
  roles: Type.Optional(
    Type.Array(Type.Enum(EnumUserRole), { description: "Filter by multiple user roles" }),
  ),
  sortBy: Type.Optional(
    Type.String({
      default: "createdAt",
      description: "Sort field: createdAt, name, email, role, updatedAt",
    }),
  ),
  sortOrder: Type.Optional(
    Type.String({ description: "Sort order: asc or desc", default: "desc" }),
  ),
});

export type ListUsersBody = Static<typeof ListUsersBodySchema>;

export const ListUsersResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(UserResponseItemSchema),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export type ListUsersResponse = Static<typeof ListUsersResponseSchema>;

export const GetUserStatsQuerySchema = Type.Object({
  periodType: Type.Optional(Type.Enum(EnumStatsPeriodType, { default: EnumStatsPeriodType.DAILY, description: "Granularity: daily, weekly, monthly" })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 12, description: "Number of historical snapshot records" })),
});

export type GetUserStatsQuery = Static<typeof GetUserStatsQuerySchema>;

export const UserStatsItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  periodType: Type.String(),
  periodKey: Type.String(),
  date: Type.String(),
  newUsersCount: Type.Number(),
  totalUsersCount: Type.Number(),
  activeUsersCount: Type.Number(),
  bannedUsersCount: Type.Number(),
  roleBreakdown: Type.Any(),
  tierBreakdown: Type.Any(),
  educationBreakdown: Type.Any(),
  createdAt: Type.String({ format: "date-time" }),
});

export const GetUserStatsResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      kpi: Type.Object({
        totalUsers: Type.Number(),
        activeUsers: Type.Number(),
        bannedUsers: Type.Number(),
        roleBreakdown: Type.Any(),
        tierBreakdown: Type.Any(),
      }),
      history: Type.Array(UserStatsItemSchema),
    }),
  }),
]);

export type GetUserStatsResponse = Static<typeof GetUserStatsResponseSchema>;
export type UserStatsItem = Static<typeof UserStatsItemSchema>;
export type UserStatsData = Static<typeof GetUserStatsResponseSchema>["data"];



