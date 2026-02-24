import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamCategoryDetailResponse } from "../types";

export interface UpdateCategoryRequest {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
}

export const useUpdateCategory = () => {
    return useMutation({
        mutationKey: ["admin-exam-categories-update"],
        mutationFn: async ({ id, ...body }: UpdateCategoryRequest) => {
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.exam.categories.admin.update.replace(":id", id),
                body,
                withCredentials: true,
            });
            return response as ExamCategoryDetailResponse;
        },
    });
};
