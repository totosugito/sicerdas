import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CourseChapterApiResponse } from "../types";

export interface ReorderChapterItem {
  id: string;
  position: string;
}

export interface ReorderChapterRequest {
  courseId: string;
  items: ReorderChapterItem[];
}

export const useReorderChapter = () => {
  return useMutation({
    mutationKey: ["admin-course-chapters-reorder"],
    mutationFn: async ({ courseId, items }: ReorderChapterRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.course.chapters.admin.reorder.replace(":courseId", courseId),
        body: { items },
        withCredentials: true,
      });
      return response as CourseChapterApiResponse;
    },
  });
};
