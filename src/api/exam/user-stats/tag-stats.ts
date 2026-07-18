import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { TagStats } from "./types";

export interface TagStatsResponse {
  success: boolean;
  message: string;
  data: TagStats[];
}

export const useTagStats = () => {
  return useQuery({
    queryKey: ["exam-user-stats-tags"],
    queryFn: async () => {
      const url = AppApi.exam.userStats.tags;
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as TagStatsResponse;
    },
  });
};
