import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ExamHistoryItem } from "./types";

export interface SessionHistoryResponse {
  success: boolean;
  message: string;
  data: {
    items: ExamHistoryItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const useSessionHistory = (
  packageId: string | undefined,
  sectionId: string | undefined,
  params: { page?: number; limit?: number } = { page: 1, limit: 5 },
) => {
  return useQuery({
    queryKey: ["exam-session-history", packageId, sectionId, params.page, params.limit],
    queryFn: async () => {
      if (!packageId || !sectionId) return null;
      const url = AppApi.exam.sessions.history;

      const response = await fetchApi({
        method: "POST",
        url,
        body: {
          packageId,
          sectionId,
          page: params.page,
          limit: params.limit,
        },
        withCredentials: true,
      });
      return response as SessionHistoryResponse;
    },
    enabled: !!packageId && !!sectionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

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
  params: { page?: number; limit?: number } = { page: 1, limit: 10 },
  options: Partial<UseQueryOptions<AllSessionHistoryResponse, Error>> = {}
) => {
  return useQuery<AllSessionHistoryResponse>({
    queryKey: ["exam-all-session-history", params.page, params.limit],
    queryFn: async () => {
      const url = AppApi.exam.sessions.allHistory;

      const response = await fetchApi({
        method: "POST",
        url,
        body: {
          page: params.page,
          limit: params.limit,
        },
        withCredentials: true,
      });
      return response as AllSessionHistoryResponse;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};
