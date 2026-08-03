import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { SyllabusResponse } from "../types";

export function useCourseSyllabus(courseId: string, options?: { enabled?: boolean }) {
  return useQuery<SyllabusResponse>({
    queryKey: ["course-syllabus", courseId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.userProgress.user.syllabus.replace(":courseId", courseId),
        withCredentials: true,
      });
      return response as SyllabusResponse;
    },
    enabled: !!courseId && (options?.enabled ?? true),
  });
}
