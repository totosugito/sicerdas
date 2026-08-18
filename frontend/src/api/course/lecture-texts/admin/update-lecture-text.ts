import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { AdminUpdateLectureTextInput, UpdateLectureTextResponse } from "../types";

export function useUpdateLectureText() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: AdminUpdateLectureTextInput | FormData;
    }) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.course.lectureTexts.admin.update.replace(":id", id),
        body: payload,
        withCredentials: true,
      });
      return response as UpdateLectureTextResponse;
    },
  });
}
