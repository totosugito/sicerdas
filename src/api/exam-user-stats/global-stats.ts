import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { GlobalStats } from "./types";

export interface GlobalStatsResponse {
  success: boolean;
  message: string;
  data: GlobalStats | null;
}

export const useGlobalStats = () => {
  return useQuery({
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
  });
};
