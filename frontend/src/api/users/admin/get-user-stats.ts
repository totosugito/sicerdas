import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { GetUserStatsQuery, GetUserStatsResponse } from "../types";

export const useGetUserStats = (params?: GetUserStatsQuery) => {
  const periodType = params?.periodType || "daily";
  const limit = params?.limit || 12;

  return useQuery({
    queryKey: ["user-stats", periodType, limit],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: `${AppApi.users.admin.stats}?periodType=${periodType}&limit=${limit}`,
        withCredentials: true,
      });
      return response as GetUserStatsResponse;
    },
  });
};
