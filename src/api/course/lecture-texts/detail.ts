import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { LectureTextDetailResponse } from "./types";

export function useCourseLectureText(id: string | null) {
  return useQuery<LectureTextDetailResponse>({
    queryKey: ["course-lecture-text-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.lectureTexts.admin.detail.replace(":id", id!),
        withCredentials: true,
      });
      return response as LectureTextDetailResponse;
    },
    enabled: !!id,
  });
}
