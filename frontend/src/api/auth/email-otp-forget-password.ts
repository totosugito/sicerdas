import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { EmailOtpForgetPasswordRequest, EmailOtpForgetPasswordResponse, BaseResponse } from "./types";


export const useEmailOtpForgetPasswordMutation = () => {
  return useMutation<EmailOtpForgetPasswordResponse, BaseResponse, { body: EmailOtpForgetPasswordRequest }>({
    mutationKey: ["emailOtpForgetPassword"],
    mutationFn: async ({ body }: { body: EmailOtpForgetPasswordRequest }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.auth.emailOtpForgetPassword,
        body: body,
        headers: { "Content-Type": "application/json" },
      });
      return response as EmailOtpForgetPasswordResponse;
    },
  });
};


