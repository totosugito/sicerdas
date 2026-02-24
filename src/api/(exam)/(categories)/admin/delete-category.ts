import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamCategoryResponse } from "../types";

export const useDeleteCategory = () => {
    return useMutation({
        mutationKey: ["admin-exam-categories-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.categories.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamCategoryResponse;
        },
    });
};
