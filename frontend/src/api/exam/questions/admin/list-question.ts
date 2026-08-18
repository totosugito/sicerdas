import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { QuestionListParams, ListQuestionsResponse } from "../types";

export const useListQuestion = (params: QuestionListParams) => {
  return useQuery({
    queryKey: ["admin-exam-questions-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questions.admin.list,
        body: params,
        withCredentials: true,
      });
      return response as ListQuestionsResponse;
    },
  });
};
