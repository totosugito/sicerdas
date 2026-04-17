import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  password: string;
}

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.admin.create,
        body: data,
        withCredentials: true,
      });
      return response as GenericResponse;
    },
  });
};
