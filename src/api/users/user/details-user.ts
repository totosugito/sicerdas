import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { UserDetailResponse } from "../types";

export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await fetchApi({ method: "GET", url: AppApi.users.user.details });
      return response as UserDetailResponse;
    },
  });
};
