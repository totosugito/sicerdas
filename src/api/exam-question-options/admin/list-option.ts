import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ListQuestionOptionsResponse } from "../types";

export interface ListQuestionOptionRequest {
    questionId?: string;
    isCorrect?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export const useListQuestionOption = (params: ListQuestionOptionRequest) => {
    return useQuery({
        queryKey: ["admin-exam-question-options-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questionOptions.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListQuestionOptionsResponse;
        },
    });
};
