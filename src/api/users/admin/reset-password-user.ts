import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export interface ResetPasswordRequest {
  id: string;
  newPassword: string;
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.admin.changePassword,
        body: data,
        withCredentials: true,
      });
      return response as GenericResponse;
    },
  });
};
