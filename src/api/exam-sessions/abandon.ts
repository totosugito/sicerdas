import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export interface AbandonSessionResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export const useAbandonSession = () => {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.abandon.replace(":id", sessionId),
        withCredentials: true,
      });
      return response as AbandonSessionResponse;
    },
  });
};
