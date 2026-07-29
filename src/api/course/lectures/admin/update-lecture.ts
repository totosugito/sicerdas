import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateLectureRequest, UpdateLectureResponse } from "../types";

export const useUpdateLecture = () => {
  return useMutation({
    mutationKey: ["admin-course-lectures-update"],
    mutationFn: async ({ id, ...body }: UpdateLectureRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.course.lectures.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as UpdateLectureResponse;
    },
  });
};
