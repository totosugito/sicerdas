import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestionOptionResponse } from "../types";

export const useDeleteQuestionOption = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.questionOptions.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamQuestionOptionResponse;
        },
    });
};

export const useDeleteMultipleQuestionOptions = () => {
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questionOptions.admin.deletes,
                body: { ids },
                withCredentials: true,
            });
            return response as ExamQuestionOptionResponse;
        },
    });
};
