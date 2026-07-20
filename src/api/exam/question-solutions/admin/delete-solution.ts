import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useDeleteQuestionSolution = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.questionSolutions.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as BaseResponse;
        },
    });
};

export const useDeleteMultipleQuestionSolutions = () => {
    return useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questionSolutions.admin.deletes,
                body: { ids },
                withCredentials: true,
            });
            return response as BaseResponse;
        },
    });
};
