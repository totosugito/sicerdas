import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionOptionDetailResponse, QuestionOptionFormValues } from "../types";

export type CreateQuestionOptionRequest = QuestionOptionFormValues;

export const useCreateQuestionOption = () => {
    return useMutation({
        mutationFn: async (payload: CreateQuestionOptionRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questionOptions.admin.create,
                body: payload,
                withCredentials: true,
            });
            return response as ExamQuestionOptionDetailResponse;
        },
    });
};
