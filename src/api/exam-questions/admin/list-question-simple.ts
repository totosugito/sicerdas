import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ListQuestionRequest, ListQuestionsResponse } from "./list-question";

export const useListQuestionSimple = (params: ListQuestionRequest) => {
  return useQuery({
    queryKey: ["admin-exam-questions-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questions.admin.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as ListQuestionsResponse;
    },
  });
};
