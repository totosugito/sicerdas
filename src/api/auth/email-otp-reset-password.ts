import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { EmailOtpResetPasswordRequest, EmailOtpResetPasswordResponse, BaseResponse } from "./types";

export const useEmailOtpResetPasswordMutation = () => {
  return useMutation<EmailOtpResetPasswordResponse, BaseResponse, { body: EmailOtpResetPasswordRequest }>({
    mutationKey: ['emailOtpResetPassword'],
    mutationFn: async ({ body }: { body: EmailOtpResetPasswordRequest }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.auth.emailOtpResetPassword,
        body: body,
        headers: { 'Content-Type': 'application/json' }
      });
      return response as EmailOtpResetPasswordResponse;
    },
  });
};
