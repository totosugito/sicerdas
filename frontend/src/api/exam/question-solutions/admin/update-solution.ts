import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateQuestionSolutionParams, QuestionSolutionDetailResponse } from "../types";

export interface UpdateQuestionSolutionRequest extends Partial<UpdateQuestionSolutionParams> {
  id?: string;
}

export const useUpdateQuestionSolution = (id?: string) => {
  return useMutation({
    mutationKey: ["admin-exam-question-solutions-update", id],
    mutationFn: async (payload: UpdateQuestionSolutionRequest | FormData) => {
      const solutionId = payload instanceof FormData ? id : payload.id || id;

      if (!solutionId) {
        throw new Error("Solution ID is required for update");
      }

      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.questionSolutions.admin.update.replace(":id", solutionId),
        body: payload,
        withCredentials: true,
      });
      return response as QuestionSolutionDetailResponse;
    },
  });
};
