import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export interface SubmitSessionResponse {
  success: boolean;
  message: string;
  data: {
    score: number;
    earnedPoints: number;
    maxPoints: number;
    totalCorrect: number;
    totalWrong: number;
    totalSkipped: number;
    totalQuestions: number;
  };
}

export const useSubmitSession = () => {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.submit.replace(":id", sessionId),
        withCredentials: true,
      });
      return response as SubmitSessionResponse;
    },
  });
};
