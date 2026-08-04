import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { SchemaCategoryStatsResponse } from "../types";

export function useCourseCategoryStats(options?: { enabled?: boolean }) {
  return useQuery<SchemaCategoryStatsResponse>({
    queryKey: ["course-user-stats-categories"],
    queryFn: async () => fetchApi({
      method: "GET",
      url: AppApi.course.userStats.user.categories,
      withCredentials: true,
    }) as Promise<SchemaCategoryStatsResponse>,
    enabled: options?.enabled ?? true,
  });
}
