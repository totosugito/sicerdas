import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { QuestionSolutionListParams, ListQuestionSolutionsResponse } from "../types";

export const useListQuestionSolution = (params: QuestionSolutionListParams) => {
    return useQuery({
        queryKey: ["admin-exam-question-solutions", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questionSolutions.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListQuestionSolutionsResponse;
        },
    });
};
