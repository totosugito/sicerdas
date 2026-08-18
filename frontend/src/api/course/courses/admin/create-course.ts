import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { AdminCreateCourseInput, CreateCourseResponse } from "../types";

export const useCreateCourse = () => {
  return useMutation({
    mutationKey: ["admin-course-courses-create"],
    mutationFn: async (body: AdminCreateCourseInput) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.courses.admin.create,
        body,
        withCredentials: true,
      });
      return response as CreateCourseResponse;
    },
  });
};
