import type { BaseResponse } from "@/api/types";

export interface EmailOtpForgetPasswordRequest {
  email: string;
}

export interface EmailOtpVerifyForgetPasswordRequest {
  email: string;
  otp: string;
}

export interface EmailOtpVerifyForgetPasswordResponseData extends BaseResponse {
  data: {
    valid: boolean;
  };
}

export interface EmailHasOtpRequest {
  email: string;
  identifier?: string;
}

export interface EmailHasOtpResponseData extends BaseResponse {
  hasOtp: boolean;
}

export interface EmailOtpResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface SignInUserResult {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: boolean;
  role: string | null;
  showAds: boolean;
  tierId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  success: boolean;
  message?: string;
  user: SignInUserResult;
  token: string;
}

export type { BaseResponse };

export type EmailOtpForgetPasswordResponse = BaseResponse;
export type EmailOtpVerifyForgetPasswordResponse = EmailOtpVerifyForgetPasswordResponseData;
export type EmailHasOtpResponse = EmailHasOtpResponseData;
export type EmailOtpResetPasswordResponse = BaseResponse;
export type LoginResponse = AuthResponseData;
