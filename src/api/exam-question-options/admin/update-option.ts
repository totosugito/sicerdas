import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionOptionDetailResponse } from "../types";

export interface UpdateQuestionOptionRequest {
    id: string;
    questionId?: string;
    content?: Record<string, unknown>[];
    isCorrect?: boolean;
    order?: number;
}

export const useUpdateQuestionOption = () => {
    return useMutation({
        mutationFn: async (payload: UpdateQuestionOptionRequest) => {
            const { id, ...body } = payload;
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.exam.questionOptions.admin.update.replace(":id", id),
                body: body,
                withCredentials: true,
            });
            return response as ExamQuestionOptionDetailResponse;
        },
    });
};
