import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { ExamQuestionDetailResponse } from "../types";

export const getQuestion = async (id: string): Promise<ExamQuestionDetailResponse> => {
    const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.questions.admin.detail.replace(":id", id),
        withCredentials: true,
    });
    return response as ExamQuestionDetailResponse;
};

export const useGetQuestion = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["admin-exam-question-detail", id],
        queryFn: () => getQuestion(id),
        enabled: enabled && !!id,
    });
};
