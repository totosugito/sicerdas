import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateChapterRequest, CreateChapterResponse } from "../types";

export const useCreateChapter = () => {
  return useMutation({
    mutationKey: ["admin-course-chapters-create"],
    mutationFn: async (body: CreateChapterRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.chapters.admin.create,
        body,
        withCredentials: true,
      });
      return response as CreateChapterResponse;
    },
  });
};
