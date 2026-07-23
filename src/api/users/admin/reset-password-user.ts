import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { BaseResponse, ResetPasswordBody } from "../types";

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordBody) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.admin.changePassword,
        body: data,
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
};
