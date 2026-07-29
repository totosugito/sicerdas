import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { LectureTextListQueryInput, PaginatedLectureTextListResponse } from "../types";

export function useListLectureText(query?: LectureTextListQueryInput) {
  return useQuery<PaginatedLectureTextListResponse>({
    queryKey: ["admin-course-lecture-texts-list", query],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.lectureTexts.admin.list,
        params: query,
        withCredentials: true,
      });
      return response as PaginatedLectureTextListResponse;
    },
  });
}
