import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { GlobalStats } from "./types";

export interface GlobalStatsResponse {
  success: boolean;
  message: string;
  data: GlobalStats | null;
}

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
