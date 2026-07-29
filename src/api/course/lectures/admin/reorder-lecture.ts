import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CourseLectureApiResponse } from "../types";

export interface ReorderLectureItem {
  id: string;
  position: string;
}

export interface ReorderLectureRequest {
  chapterId: string;
  items: ReorderLectureItem[];
}

export const useReorderLecture = () => {
  return useMutation({
    mutationKey: ["admin-course-lectures-reorder"],
    mutationFn: async ({ chapterId, items }: ReorderLectureRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.course.lectures.admin.reorder.replace(":chapterId", chapterId),
        body: { items },
        withCredentials: true,
      });
      return response as CourseLectureApiResponse;
    },
  });
};
