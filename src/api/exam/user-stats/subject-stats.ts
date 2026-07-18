import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { SubjectStats } from "./types";

export interface SubjectStatsResponse {
  success: boolean;
  message: string;
  data: {
    items: SubjectStats[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const useSubjectStats = (
  params: { days?: number; page?: number; limit?: number; sortBy?: string; order?: "asc" | "desc" } = { page: 1, limit: 10 },
  options: Partial<UseQueryOptions<SubjectStatsResponse, Error>> = {}
) => {
  return useQuery<SubjectStatsResponse>({
    queryKey: ["exam-user-stats-subjects", params],
    queryFn: async () => {
      const url = AppApi.exam.userStats.subjects;
      const response = await fetchApi({
        method: "POST",
        url,
        body: params,
        withCredentials: true,
      });
      return response as SubjectStatsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
