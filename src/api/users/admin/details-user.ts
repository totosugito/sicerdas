import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { UserDetailResponse } from "./types";

export const useUserDetails = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["user-details", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.users.admin.details.replace(":id", id),
        withCredentials: true,
      });
      return response as UserDetailResponse;
    },
    enabled: !!id && enabled,
  });
};
