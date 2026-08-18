import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { DeleteChapterResponse } from "../types";

export const useDeleteChapter = () => {
  return useMutation({
    mutationKey: ["admin-course-chapters-delete"],
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.course.chapters.admin.delete.replace(":id", id),
        withCredentials: true,
      });
      return response as DeleteChapterResponse;
    },
  });
};
