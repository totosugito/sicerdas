import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateChapterRequest, UpdateChapterResponse } from "../types";

export const useUpdateChapter = () => {
  return useMutation({
    mutationKey: ["admin-course-chapters-update"],
    mutationFn: async ({ id, ...body }: UpdateChapterRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.course.chapters.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as UpdateChapterResponse;
    },
  });
};
