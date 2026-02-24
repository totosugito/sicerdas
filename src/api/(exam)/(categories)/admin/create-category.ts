import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamCategoryDetailResponse } from "../types";

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    isActive?: boolean;
}

export const useCreateCategory = () => {
    return useMutation({
        mutationKey: ["admin-exam-categories-create"],
        mutationFn: async (body: CreateCategoryRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.categories.admin.create,
                body,
                withCredentials: true,
            });
            return response as ExamCategoryDetailResponse;
        },
    });
};
