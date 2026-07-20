import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateQuestionParams, UpdateQuestionResponse } from "../types";

export const useUpdateQuestion = (id: string) => {
  return useMutation({
    mutationKey: ["admin-exam-questions-update", id],
    mutationFn: async (body: UpdateQuestionParams | FormData) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.questions.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as UpdateQuestionResponse;
    },
  });
};
