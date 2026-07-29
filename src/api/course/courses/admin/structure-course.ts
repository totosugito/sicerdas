import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { BaseResponse } from "backend/src/types/index.ts";
import type { ChapterItem } from "@/api/course/chapters";
import type { LectureItem } from "@/api/course/lectures";

export interface CourseStructureChapter extends ChapterItem {
  lectures: LectureItem[];
}

export interface CourseStructureResponse extends BaseResponse {
  data: CourseStructureChapter[];
}

export function useAdminCourseStructure(courseId: string) {
  return useQuery<CourseStructureResponse>({
    queryKey: ["admin-course-structure", courseId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.courses.admin.structure.replace(":id", courseId),
        withCredentials: true,
      });
      return response as CourseStructureResponse;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
