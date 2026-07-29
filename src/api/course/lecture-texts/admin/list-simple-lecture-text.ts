import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { LectureTextSimpleQueryInput, PaginatedLectureTextSimpleResponse } from "../types";

export function useListLectureTextSimple(
  query?: LectureTextSimpleQueryInput,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedLectureTextSimpleResponse>({
    queryKey: ["admin-course-lecture-texts-list-simple", query],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.lectureTexts.admin.listSimple,
        params: query,
        withCredentials: true,
      });
      return response as PaginatedLectureTextSimpleResponse;
    },
    enabled: options?.enabled !== false,
  });
}
