import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { SaveAnswerRequest } from "./types";

export interface SaveAnswerResponse {
  success: boolean;
  message: string;
}

export const useSaveAnswer = () => {
  return useMutation({
    mutationFn: async (body: SaveAnswerRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.saveAnswer,
        body,
        withCredentials: true,
      });
      return response as SaveAnswerResponse;
    },
  });
};
