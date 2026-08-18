import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { BaseResponse } from "backend/src/types/index.ts";
import type { ChangePasswordBody } from "../types";

export const useChangeUserPasswordMutation = () => {
  return useMutation({
    mutationKey: ["change-user-password"],
    mutationFn: async ({ body }: { body: ChangePasswordBody }) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.users.user.changePassword,
        body: body,
      });
      return response as BaseResponse;
    },
  });
};
