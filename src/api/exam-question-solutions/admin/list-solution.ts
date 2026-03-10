import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ListQuestionSolutionsResponse } from "../types";

export interface ListQuestionSolutionRequest {
    questionId?: string;
    solutionType?: string;
    requiredTier?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
}

export const useListQuestionSolution = (params: ListQuestionSolutionRequest) => {
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
