import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export interface UpdateUserAvatarRequest {
  id: string;
  file?: File;
  action?: "remove";
}

export const useUpdateUserAvatar = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserAvatarRequest) => {
      const formData = new FormData();
      formData.append("id", data.id);

      if (data.file) {
        formData.append("file", data.file);
      }

      if (data.action) {
        formData.append("action", data.action);
      }

      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.avatar,
        body: formData,
        withCredentials: true,
        // FormData is automatically handled by fetchApi or underlying fetch
      });
      return response as GenericResponse;
    },
  });
};
