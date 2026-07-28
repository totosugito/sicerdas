import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { ChapterListResponse } from "../types";

export const useListChapter = (courseId: string) => {
  return useQuery({
    queryKey: ["admin-course-chapters-list", courseId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.chapters.admin.list.replace(":courseId", courseId),
        withCredentials: true,
      });
      return response as ChapterListResponse;
    },
    enabled: !!courseId,
  });
};
