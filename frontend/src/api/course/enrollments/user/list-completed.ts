import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { UserCourseListResponse } from "../types";

export function useCompletedCourses(params?: { page?: number; limit?: number }, options?: { enabled?: boolean; staleTime?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 5;
  return useQuery<UserCourseListResponse>({
    queryKey: ["course-enrollments-completed", page, limit],
    queryFn: async () => fetchApi({
      method: "GET",
      url: AppApi.course.enrollments.user.completed,
      params: { page, limit },
      withCredentials: true,
    }) as Promise<UserCourseListResponse>,
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 30000,
  });
}
