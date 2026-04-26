import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export interface SubmitSessionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    score: string;
    totalCorrect: number;
    totalWrong: number;
    totalSkipped: number;
  };
}

export const useSubmitSession = () => {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.submit.replace(":id", sessionId),
        withCredentials: true,
      });
      return response as SubmitSessionResponse;
    },
  });
};
