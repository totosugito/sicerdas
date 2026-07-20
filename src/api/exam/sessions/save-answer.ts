import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { SaveAnswerBodyType, SaveAnswerResponse } from "./types";

export const useSaveAnswer = () => {
  return useMutation({
    mutationFn: async (body: SaveAnswerBodyType) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.saveAnswer,
        body,
        withCredentials: true,
      });
      return response as SaveAnswerResponse;
    },
  });
};
