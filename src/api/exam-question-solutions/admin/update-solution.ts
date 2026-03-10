import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionSolutionDetailResponse, QuestionSolutionFormValues } from "../types";

export type UpdateQuestionSolutionRequest = Partial<QuestionSolutionFormValues> & { id: string };

export const useUpdateQuestionSolution = () => {
    return useMutation({
        mutationFn: async (payload: UpdateQuestionSolutionRequest) => {
            const { id, ...data } = payload;
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.exam.questionSolutions.admin.update.replace(":id", id),
                body: data,
                withCredentials: true,
            });
            return response as ExamQuestionSolutionDetailResponse;
        },
    });
};
