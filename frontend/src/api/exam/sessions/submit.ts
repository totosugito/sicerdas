import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { SubmitSessionResponse } from "./types";

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
