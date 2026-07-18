import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { CreateUserParams, UserResponse } from "../types";

// Extends CreateUserParams locally with password since backend createUserService gets hashedPassword, but the route body gets raw password
export interface CreateUserRequest extends Omit<CreateUserParams, "hashedPassword"> {
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
      return response as UserResponse;
    },
  });
};
