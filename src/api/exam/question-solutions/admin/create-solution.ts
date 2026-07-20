import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateQuestionSolutionParams, QuestionSolutionDetailResponse } from "../types";

export type CreateQuestionSolutionRequest = CreateQuestionSolutionParams;

export const useCreateQuestionSolution = () => {
  return useMutation({
    mutationFn: async (payload: CreateQuestionSolutionRequest | FormData) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questionSolutions.admin.create,
        body: payload,
        withCredentials: true,
      });
      return response as QuestionSolutionDetailResponse;
    },
  });
};
