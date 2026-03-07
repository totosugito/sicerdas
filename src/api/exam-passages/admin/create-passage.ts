import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

interface CreatePassageResponse {
    success: boolean;
    message: string;
    data: { id: string };
}

export interface CreatePassageRequest {
    title?: string;
    content: Record<string, unknown>[];
    subjectId: string;
    isActive?: boolean;
}

export const useCreatePassage = () => {
    return useMutation({
        mutationKey: ["admin-exam-passages-create"],
        mutationFn: async (body: CreatePassageRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.passages.admin.create,
                body,
                withCredentials: true,
            });
            return response as CreatePassageResponse;
        },
    });
};
