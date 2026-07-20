import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { StartSessionBodyType, StartSessionResponse } from "./types";

export const useStartSession = () => {
  return useMutation({
    mutationFn: async (body: StartSessionBodyType) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.start,
        body,
        withCredentials: true,
      });
      return response as StartSessionResponse;
    },
  });
};
