import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { DeleteLectureResponse } from "../types";

export const useDeleteLecture = () => {
  return useMutation({
    mutationKey: ["admin-course-lectures-delete"],
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.course.lectures.admin.delete.replace(":id", id),
        withCredentials: true,
      });
      return response as DeleteLectureResponse;
    },
  });
};
