import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { UserResponse } from "../types";

export const useUpdateUserAvatarMutation = () => {
  return useMutation({
    mutationKey: ["update-user-avatar"],
    mutationFn: async ({ body, action }: { body?: FormData; action?: string }) => {
      const params = action ? { action } : {};
      const response = await fetchApi({
        method: "PATCH",
        url: AppApi.users.user.avatar,
        body: body,
        params: params,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response as UserResponse<{ image: string | null }>;
    },
  });
};
