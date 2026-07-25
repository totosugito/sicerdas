import type {
  EmailOtpForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordResponseData,
  EmailHasOtpRequest,
  EmailHasOtpResponseData,
  EmailOtpResetPasswordRequest,
  AuthResponseData,
} from "backend/src/modules/auth/index.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  EmailOtpForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordResponseData,
  EmailHasOtpRequest,
  EmailHasOtpResponseData,
  EmailOtpResetPasswordRequest,
  BaseResponse,
  AuthResponseData,
};

export type EmailOtpForgetPasswordResponse = BaseResponse;
export type EmailOtpVerifyForgetPasswordResponse = EmailOtpVerifyForgetPasswordResponseData;
export type EmailHasOtpResponse = EmailHasOtpResponseData;
export type EmailOtpResetPasswordResponse = BaseResponse;
export type LoginResponse = AuthResponseData;







