import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateCourseRequest, UpdateCourseResponse } from "../types";

export const useUpdateCourse = () => {
  return useMutation({
    mutationKey: ["admin-course-courses-update"],
    mutationFn: async ({ id, ...body }: UpdateCourseRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.course.courses.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as UpdateCourseResponse;
    },
  });
};
