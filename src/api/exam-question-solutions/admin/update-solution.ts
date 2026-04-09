import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionSolutionDetailResponse, QuestionSolutionFormValues } from "../types";

export type UpdateQuestionSolutionRequest = Partial<QuestionSolutionFormValues>;

export const useUpdateQuestionSolution = (id: string) => {
  return useMutation({
    mutationKey: ["admin-exam-question-solutions-update", id],
    mutationFn: async (payload: UpdateQuestionSolutionRequest | FormData) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.questionSolutions.admin.update.replace(":id", id),
        body: payload,
        withCredentials: true,
      });
      return response as ExamQuestionSolutionDetailResponse;
    },
  });
};
