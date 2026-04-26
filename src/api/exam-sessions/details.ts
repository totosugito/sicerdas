import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { ExamSessionDetails } from "./types";

export interface SessionDetailsResponse {
  success: boolean;
  message: string;
  data: ExamSessionDetails;
}

export const useSessionDetails = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ["exam-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.sessions.user.details.replace(":id", sessionId),
        withCredentials: true,
      });
      return response as SessionDetailsResponse;
    },
    enabled: !!sessionId,
  });
};
