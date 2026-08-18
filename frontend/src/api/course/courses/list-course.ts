import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { PublicCourseListParams, PaginatedCourseListResponse } from "./types";

export const useListCourseClient = (params: PublicCourseListParams) => {
  return useQuery({
    queryKey: ["course-courses-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.courses.list,
        body: params,
        withCredentials: true,
      });
      return response as PaginatedCourseListResponse;
    },
  });
};
