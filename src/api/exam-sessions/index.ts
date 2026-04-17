import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  StartSessionResponse,
  SessionDetailsResponse,
  SaveAnswerRequest,
  CommonResponse,
} from "./types";

export const useStartSession = () => {
  return useMutation({
    mutationKey: ["exam-sessions-start"],
    mutationFn: async (packageId: string) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.start,
        body: { packageId },
        withCredentials: true,
      });
      return response as StartSessionResponse;
    },
  });
};

export const useSessionDetails = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["exam-sessions-details", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.sessions.user.details.replace(":id", id),
        withCredentials: true,
      });
      return response as SessionDetailsResponse;
    },
    enabled: !!id && enabled,
  });
};

export const useSaveAnswer = () => {
  return useMutation({
    mutationKey: ["exam-sessions-save-answer"],
    mutationFn: async (body: SaveAnswerRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.saveAnswer,
        body,
        withCredentials: true,
      });
      return response as CommonResponse;
    },
  });
};

export const useSubmitSession = () => {
  return useMutation({
    mutationKey: ["exam-sessions-submit"],
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.sessions.user.submit.replace(":id", id),
        withCredentials: true,
      });
      return response as CommonResponse;
    },
  });
};
