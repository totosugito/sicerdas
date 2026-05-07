import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { GlobalStats } from "./types";

export interface GlobalStatsResponse {
  success: boolean;
  message: string;
  data: GlobalStats | null;
}

export const useGlobalStats = (params?: { days?: number }) => {
  return useQuery({
    queryKey: ["exam-user-stats-global", params],
    queryFn: async () => {
      let url = AppApi.exam.userStats.global;
      if (params?.days) {
        url += `?days=${params.days}`;
      }
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as GlobalStatsResponse;
    },
  });
};
