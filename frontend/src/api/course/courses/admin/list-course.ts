import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { AdminCourseListParams, PaginatedCourseListResponse } from "../types";

export const useListCourse = (params: AdminCourseListParams) => {
  return useQuery({
    queryKey: ["admin-course-courses-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.courses.admin.list,
        body: params,
        withCredentials: true,
      });
      return response as PaginatedCourseListResponse;
    },
  });
};
