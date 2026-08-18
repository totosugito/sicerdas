import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { AdminCreateLectureTextInput, CreateLectureTextResponse } from "../types";

export function useCreateLectureText() {
  return useMutation({
    mutationFn: async (payload: AdminCreateLectureTextInput | FormData) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.course.lectureTexts.admin.create,
        body: payload,
        withCredentials: true,
      });
      return response as CreateLectureTextResponse;
    },
  });
}
