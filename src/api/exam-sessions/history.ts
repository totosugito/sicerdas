import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { ExamHistoryItem } from "./types";

export interface SessionHistoryResponse {
  success: boolean;
  message: string;
  data: ExamHistoryItem[];
}

export const useSessionHistory = (packageId: string | undefined, sectionId: string | undefined) => {
  return useQuery({
    queryKey: ["exam-session-history", packageId, sectionId],
    queryFn: async () => {
      if (!packageId || !sectionId) return null;
      const url = AppApi.exam.sessions.user.history
        .replace(":packageId", packageId)
        .replace(":sectionId", sectionId);

      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as SessionHistoryResponse;
    },
    enabled: !!packageId && !!sectionId,
  });
};
