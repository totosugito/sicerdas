import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { SchemaGlobalStatsResponse } from "../types";

export function useCourseGlobalStats(options?: { enabled?: boolean }) {
  return useQuery<SchemaGlobalStatsResponse>({
    queryKey: ["course-user-stats-global"],
    queryFn: async () => fetchApi({
      method: "GET",
      url: AppApi.course.userStats.user.global,
      withCredentials: true,
    }) as Promise<SchemaGlobalStatsResponse>,
    enabled: options?.enabled ?? true,
  });
}
