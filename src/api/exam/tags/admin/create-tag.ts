import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamTagDetailResponse } from "../types";

export interface CreateTagRequest {
    name: string;
    description?: string;
    isActive?: boolean;
}

export const useCreateTag = () => {
    return useMutation({
        mutationKey: ["admin-exam-tags-create"],
        mutationFn: async (body: CreateTagRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.tags.admin.create,
                body,
                withCredentials: true,
            });
            return response as ExamTagDetailResponse;
        },
    });
};
