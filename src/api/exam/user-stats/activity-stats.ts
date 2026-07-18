import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ActivityStats } from "./types";

export interface ActivityStatsResponse {
  success: boolean;
  message: string;
  data: ActivityStats[];
}

export const useActivityStats = (params?: { days?: number }, options: Partial<UseQueryOptions<ActivityStatsResponse, Error>> = {}) => {
  const days = params?.days ?? 7;
  return useQuery<ActivityStatsResponse>({
    queryKey: ["exam-user-stats-activity", days],
    queryFn: async () => {
      const url = AppApi.exam.userStats.activity + `?days=${days}`;
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as ActivityStatsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
