import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { DeleteCourseResponse } from "../types";

export const useDeleteCourse = () => {
  return useMutation({
    mutationKey: ["admin-course-courses-delete"],
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.course.courses.admin.delete.replace(":id", id),
        withCredentials: true,
      });
      return response as DeleteCourseResponse;
    },
  });
};
