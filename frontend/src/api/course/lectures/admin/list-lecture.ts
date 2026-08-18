import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { LectureListResponse } from "../types";

export const useListLecture = (chapterId: string) => {
  return useQuery({
    queryKey: ["admin-course-lectures-list", chapterId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.lectures.admin.list.replace(":chapterId", chapterId),
        withCredentials: true,
      });
      return response as LectureListResponse;
    },
    enabled: !!chapterId,
  });
};
