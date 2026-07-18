import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { GlobalStatsResponse } from "./types";

export const useGlobalStats = (options: Partial<UseQueryOptions<GlobalStatsResponse, Error>> = {}) => {
  return useQuery<GlobalStatsResponse>({
    queryKey: ["exam-user-stats-global"],
    queryFn: async () => {
      const url = AppApi.exam.userStats.global;
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as GlobalStatsResponse;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
