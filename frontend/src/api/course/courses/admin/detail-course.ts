import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { CourseDetailResponse } from "../types";

export const useDetailCourse = (id: string) => {
  return useQuery({
    queryKey: ["admin-course-courses-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.courses.admin.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as CourseDetailResponse;
    },
    enabled: !!id,
  });
};
