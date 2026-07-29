import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { LectureTextDetailResponse } from "../types";

export function useDetailLectureText(id: string) {
  return useQuery<LectureTextDetailResponse>({
    queryKey: ["admin-course-lecture-texts-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.lectureTexts.admin.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as LectureTextDetailResponse;
    },
    enabled: !!id,
  });
}
