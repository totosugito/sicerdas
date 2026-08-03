import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { UserCourseListResponse } from "../types";

export function useActiveCourses(options?: { enabled?: boolean }) {
  return useQuery<UserCourseListResponse>({
    queryKey: ["course-enrollments-active"],
    queryFn: async () => fetchApi({ method: "GET", url: AppApi.course.enrollments.user.active, params: { page: 1, limit: 100 }, withCredentials: true }) as Promise<UserCourseListResponse>,
    enabled: options?.enabled ?? true,
  });
}
