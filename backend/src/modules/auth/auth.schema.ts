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


