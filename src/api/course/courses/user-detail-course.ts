import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { CourseUserDetailResponse } from "./types";

export function useUserDetailCourseClient(id: string) {
  return useQuery<CourseUserDetailResponse>({
    queryKey: ["course-courses-user-detail", id],
    queryFn: async () => fetchApi({ method: "GET", url: AppApi.course.courses.user.detail.replace(":id", id), withCredentials: true }) as Promise<CourseUserDetailResponse>,
    enabled: !!id,
  });
}
