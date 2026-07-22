import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";
import { EnumUserRole } from "../../db/schema/user/index.ts";

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

