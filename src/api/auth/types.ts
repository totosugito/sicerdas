import type {
  EmailOtpForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordResponseData,
  EmailHasOtpRequest,
  EmailHasOtpResponseData,
} from "backend/src/modules/auth/index.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  EmailOtpForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordRequest,
  EmailOtpVerifyForgetPasswordResponseData,
  EmailHasOtpRequest,
  EmailHasOtpResponseData,
  BaseResponse,
};

export type EmailOtpForgetPasswordResponse = BaseResponse;
export type EmailOtpVerifyForgetPasswordResponse = EmailOtpVerifyForgetPasswordResponseData;
export type EmailHasOtpResponse = EmailHasOtpResponseData;







