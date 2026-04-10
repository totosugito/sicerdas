import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionOptionDetailResponse } from "../types";

export interface UpdateQuestionOptionRequest {
  id?: string;
  questionId?: string;
  content?: Record<string, unknown>[];
  isCorrect?: boolean;
  score?: number;
  order?: number;
}

export const useUpdateQuestionOption = (id?: string) => {
  return useMutation({
    mutationKey: ["admin-exam-question-options-update", id],
    mutationFn: async (payload: UpdateQuestionOptionRequest | FormData) => {
      const optionId = payload instanceof FormData ? id : payload.id || id;

      if (!optionId) {
        throw new Error("Option ID is required for update");
      }

      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.questionOptions.admin.update.replace(":id", optionId),
        body: payload,
        withCredentials: true,
      });
      return response as ExamQuestionOptionDetailResponse;
    },
  });
};
