import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema } from "../../types/response.ts";

export const EmailOtpForgetPasswordBody = Type.Object({
  email: Type.String({ format: "email" }),
});

export type EmailOtpForgetPasswordRequest = Static<typeof EmailOtpForgetPasswordBody>;

export const EmailOtpVerifyForgetPasswordBody = Type.Object({
  email: Type.String({ format: "email" }),
  otp: Type.String(),
});

export type EmailOtpVerifyForgetPasswordRequest = Static<typeof EmailOtpVerifyForgetPasswordBody>;

export const EmailOtpVerifyForgetPasswordResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      valid: Type.Boolean(),
    }),
  }),
]);

export type EmailOtpVerifyForgetPasswordResponseData = Static<typeof EmailOtpVerifyForgetPasswordResponse>;

export const EmailHasOtpBody = Type.Object({
  email: Type.String({ format: "email" }),
  identifier: Type.Optional(Type.String()),
});

export type EmailHasOtpRequest = Static<typeof EmailHasOtpBody>;

export const EmailHasOtpResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    hasOtp: Type.Boolean(),
  }),
]);

export type EmailHasOtpResponseData = Static<typeof EmailHasOtpResponse>;

export const EmailOtpResetPasswordBody = Type.Object({
  email: Type.String({ format: "email" }),
  otp: Type.String(),
  password: Type.String(),
});

export type EmailOtpResetPasswordRequest = Static<typeof EmailOtpResetPasswordBody>;

export const UserResponse = Type.Object({
  id: Type.String({ format: "uuid" }),
  email: Type.String({ format: "email" }),
  name: Type.Union([Type.String(), Type.Null()]),
  image: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  role: Type.Union([Type.String(), Type.Null()]),
  showAds: Type.Boolean(),
  tierId: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type SignInUserResult = Static<typeof UserResponse>;


export const AuthResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.Optional(Type.String()),
  user: UserResponse,
  token: Type.String(),
});

export type AuthResponseData = Static<typeof AuthResponse>;




