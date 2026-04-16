import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export interface BanUserRequest {
  id: string;
  banned: boolean;
  banReason?: string;
}

export const useBanUser = () => {
  return useMutation({
    mutationFn: async (data: BanUserRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.ban,
        body: data,
        withCredentials: true,
      });
      return response as GenericResponse;
    },
  });
};
