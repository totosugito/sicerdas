import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";
import { EnumUserRole } from "../../db/schema/user/index.ts";

export const UserResponseItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.String(),
  role: Type.Enum(EnumUserRole),
  image: Type.Union([Type.String(), Type.Null()]),
  banned: Type.Union([Type.Boolean(), Type.Null()]),
  banReason: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export const UserResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: UserResponseItemSchema,
  }),
]);

export const UserDetailsResponseItemSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.Union([Type.String(), Type.Null()]),
  role: Type.Enum(EnumUserRole),
  image: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  banned: Type.Boolean(),
  banReason: Type.Union([Type.String(), Type.Null()]),
  banExpires: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
  phone: Type.Union([Type.String(), Type.Null()]),
  address: Type.Union([Type.String(), Type.Null()]),
  bio: Type.Union([Type.String(), Type.Null()]),
  dateOfBirth: Type.Union([Type.String(), Type.Null()]),
  school: Type.Union([Type.String(), Type.Null()]),
  educationLevel: Type.Union([Type.String(), Type.Null()]),
  grade: Type.Union([Type.String(), Type.Null()]),
  providerId: Type.Union([Type.String(), Type.Null()]),
  extra: Type.Object({}, { additionalProperties: true }),
});

export const UserDetailsResponseSchema = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: UserDetailsResponseItemSchema,
  }),
]);

export const UserProfileDataSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.Union([Type.String(), Type.Null()]),
  image: Type.Union([Type.String(), Type.Null()]),
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
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

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
