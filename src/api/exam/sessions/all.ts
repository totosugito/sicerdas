import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ExamHistoryItem, ExamSessionStatus } from "./types";

export interface AllSessionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    items: (ExamHistoryItem & { packageTitle: string; sectionTitle: string; packageId: string })[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const useAllSessionHistory = (
  params: { page?: number; limit?: number; status?: ExamSessionStatus } = { page: 1, limit: 10 },
  options: Partial<UseQueryOptions<AllSessionHistoryResponse, Error>> = {}
) => {
  return useQuery<AllSessionHistoryResponse>({
    queryKey: ["exam-all-session-history", params.page, params.limit, params.status],
    queryFn: async () => {
      const url = AppApi.exam.sessions.allHistory;

      const response = await fetchApi({
        method: "POST",
        url,
        body: {
          page: params.page,
          limit: params.limit,
          status: params.status,
        },
        withCredentials: true,
      });
      return response as AllSessionHistoryResponse;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};
