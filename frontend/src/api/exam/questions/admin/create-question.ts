import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateQuestionParams, CreateQuestionResponse } from "../types";

export const useCreateQuestion = () => {
  return useMutation({
    mutationKey: ["admin-exam-questions-create"],
    mutationFn: async (body: CreateQuestionParams | FormData) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questions.admin.create,
        body,
        withCredentials: true,
      });
      return response as CreateQuestionResponse;
    },
  });
};
