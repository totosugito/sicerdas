import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { DetailsSessionResponse } from "./types";

export const useSessionDetails = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ["exam-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.sessions.details.replace(":id", sessionId),
        withCredentials: true,
      });
      return response as DetailsSessionResponse;
    },
    enabled: !!sessionId,
  });
};
