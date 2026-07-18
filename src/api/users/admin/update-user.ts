import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { UpdateUserParams, UserResponse } from "../types";

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserParams) => {
      const response = await fetchApi({
        method: "PATCH",
        url: AppApi.users.admin.update,
        body: data,
        withCredentials: true,
      });
      return response as UserResponse;
    },
  });
};
