import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { EmailOtpVerifyForgetPasswordRequest, EmailOtpVerifyForgetPasswordResponse, BaseResponse } from "./types";


export const useEmailOtpVerifyForgetPasswordMutation = () => {
  return useMutation<EmailOtpVerifyForgetPasswordResponse, BaseResponse, { body: EmailOtpVerifyForgetPasswordRequest }>({
    mutationKey: ["emailOtpVerifyForgetPassword"],
    mutationFn: async ({ body }: { body: EmailOtpVerifyForgetPasswordRequest }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.auth.emailOtpVerifyForgetPassword,
        body: body,
        headers: { "Content-Type": "application/json" },
      });
      return response as EmailOtpVerifyForgetPasswordResponse;
    },
  });
};


