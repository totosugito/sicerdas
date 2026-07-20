import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { QuestionSessionResponse } from "./types";

export const useSessionQuestion = (sessionId: string | undefined, questionId: string | null) => {
  return useQuery({
    queryKey: ["exam-session-question", sessionId, questionId],
    queryFn: async () => {
      if (!sessionId || !questionId) return null;
      const url = AppApi.exam.sessions.question
        .replace(":id", sessionId)
        .replace(":questionId", questionId);

      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as QuestionSessionResponse;
    },
    enabled: !!sessionId && !!questionId,
  });
};
