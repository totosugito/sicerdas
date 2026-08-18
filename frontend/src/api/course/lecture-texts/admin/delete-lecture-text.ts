import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { DeleteLectureTextResponse } from "../types";

export function useDeleteLectureText() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.course.lectureTexts.admin.delete.replace(":id", id),
        withCredentials: true,
      });
      return response as DeleteLectureTextResponse;
    },
  });
}
