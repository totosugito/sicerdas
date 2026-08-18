import { useMutation } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { BaseResponse } from "backend/src/types/index.ts";

export function useEnrollCourse() {
  return useMutation<BaseResponse, unknown, string>({
    mutationFn: async (courseId) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.enrollments.user.enroll.replace(":courseId", courseId),
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
}
