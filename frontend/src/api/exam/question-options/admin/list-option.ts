import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { QuestionOptionListParams, ListQuestionOptionsResponse } from "../types";

export const useListQuestionOption = (params: QuestionOptionListParams) => {
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
