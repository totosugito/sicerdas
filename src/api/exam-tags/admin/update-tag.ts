import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamTagDetailResponse } from "../types";

export interface UpdateTagRequest {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
}

export const useUpdateTag = () => {
    return useMutation({
        mutationKey: ["admin-exam-tags-update"],
        mutationFn: async ({ id, ...body }: UpdateTagRequest) => {
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.exam.tags.admin.update.replace(":id", id),
                body,
                withCredentials: true,
            });
            return response as ExamTagDetailResponse;
        },
    });
};
