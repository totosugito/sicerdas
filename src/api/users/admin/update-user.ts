import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export interface UpdateUserRequest {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await fetchApi({
        method: "PATCH",
        url: AppApi.users.admin.update,
        body: data,
        withCredentials: true,
      });
      return response as GenericResponse;
    },
  });
};
