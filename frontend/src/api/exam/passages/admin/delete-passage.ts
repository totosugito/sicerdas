import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useDeletePassage = () => {
    return useMutation({
        mutationKey: ["admin-exam-passages-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.passages.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as BaseResponse;
        },
    });
};
