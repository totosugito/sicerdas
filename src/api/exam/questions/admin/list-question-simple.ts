import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { QuestionListSimpleParams, ListSimpleQuestionsResponse } from "../types";

export const useListQuestionSimple = (params: QuestionListSimpleParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-exam-questions-list-simple", params],
    enabled,
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questions.admin.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as ListSimpleQuestionsResponse;
    },
  });
};
