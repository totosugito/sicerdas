import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { BaseResponse } from "backend/src/types/index.ts";
import type { CourseStructureResponse } from "./admin/structure-course";

export const useCourseStructureClient = (courseId: string) => {
  return useQuery<CourseStructureResponse>({
    queryKey: ["course-courses-structure", courseId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.courses.structure.replace(":id", courseId),
        withCredentials: true,
      });
      return response as CourseStructureResponse;
    },
    enabled: !!courseId,
  });
};
