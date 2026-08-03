import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { CourseUserDetailResponse } from "./types";

export const useDetailCourseClient = (id: string) => {
  return useQuery({
    queryKey: ["course-courses-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.courses.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as CourseUserDetailResponse;
    },
    enabled: !!id,
  });
};
