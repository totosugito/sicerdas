import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { QuestionTagListRequest, QuestionTagListResponse } from "../types";

export const useListQuestionTag = (params: QuestionTagListRequest = {}) => {
    return useQuery({
        queryKey: ["admin-exam-question-tags-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questionTags.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as QuestionTagListResponse;
        },
    });
};
