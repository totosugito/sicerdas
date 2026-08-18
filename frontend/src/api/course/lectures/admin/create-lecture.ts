import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateLectureRequest, CreateLectureResponse } from "../types";

export const useCreateLecture = () => {
  return useMutation({
    mutationKey: ["admin-course-lectures-create"],
    mutationFn: async (body: CreateLectureRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.lectures.admin.create,
        body,
        withCredentials: true,
      });
      return response as CreateLectureResponse;
    },
  });
};
