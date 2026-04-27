import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
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
      const url = AppApi.exam.sessions.user.history;

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
  });
};
