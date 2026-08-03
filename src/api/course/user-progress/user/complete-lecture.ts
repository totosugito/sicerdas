import { useMutation } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { ProgressResponse } from "../types";

export function useCompleteLecture() {
  return useMutation<ProgressResponse, unknown, string>({
    mutationFn: async (lectureId) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.userProgress.user.complete.replace(":lectureId", lectureId),
        withCredentials: true,
      });
      return response as ProgressResponse;
    },
  });
}
