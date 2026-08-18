import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { UserSessionsResponse } from "../types";

export const useUserSessionsQuery = () => {
  return useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const response = await fetchApi({ method: "GET", url: AppApi.users.user.sessions });
      return response as UserSessionsResponse;
    },
  });
};
