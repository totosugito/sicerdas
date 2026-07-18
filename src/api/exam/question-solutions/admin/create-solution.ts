import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionSolutionDetailResponse, QuestionSolutionFormValues } from "../types";

export type CreateQuestionSolutionRequest = QuestionSolutionFormValues;

export const useCreateQuestionSolution = () => {
  return useMutation({
    mutationFn: async (payload: CreateQuestionSolutionRequest | FormData) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questionSolutions.admin.create,
        body: payload,
        withCredentials: true,
      });
      return response as ExamQuestionSolutionDetailResponse;
    },
  });
};
