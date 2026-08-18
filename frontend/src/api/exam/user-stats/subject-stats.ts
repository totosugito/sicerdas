import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { SubjectStatsParams, SubjectStatsResponse } from "./types";

export const useSubjectStats = (
  params: SubjectStatsParams = { page: 1, limit: 10 },
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
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
