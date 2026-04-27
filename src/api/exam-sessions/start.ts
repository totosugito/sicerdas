import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { StartSessionRequest, ExamSession } from "./types";

export interface StartSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    isResumed: boolean;
  };
}

export const useStartSession = () => {
  return useMutation({
    mutationFn: async (body: StartSessionRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.start,
        body,
        withCredentials: true,
      });
      return response as StartSessionResponse;
    },
  });
};
