import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export interface UpdateUserAvatarResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    image: string | null;
  };
}

export const useUpdateUserAvatarMutation = () => {
  return useMutation({
    mutationKey: ["update-user-avatar"],
    mutationFn: async ({ body, action }: { body?: FormData; action?: string }) => {
      const params = action ? { action } : {};
      const response = await fetchApi({
        method: "PATCH",
        url: AppApi.user.avatar,
        body: body,
        params: params,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response as UpdateUserAvatarResponse;
    },
  });
};
