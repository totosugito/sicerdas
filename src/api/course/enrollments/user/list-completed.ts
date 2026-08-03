import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { UserCourseListResponse } from "../types";

export function useCompletedCourses() {
  return useQuery<UserCourseListResponse>({
    queryKey: ["course-enrollments-completed"],
    queryFn: async () => fetchApi({ method: "GET", url: AppApi.course.enrollments.user.completed, params: { page: 1, limit: 100 }, withCredentials: true }) as Promise<UserCourseListResponse>,
  });
}
