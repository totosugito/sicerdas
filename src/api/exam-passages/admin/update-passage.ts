import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

interface UpdatePassageResponse {
    success: boolean;
    message: string;
    data: { id: string };
}

export interface UpdatePassageRequest {
    id: string;
    title?: string | null;
    content?: Record<string, unknown>[];
    subjectId?: string;
    isActive?: boolean;
}

export const useUpdatePassage = () => {
    return useMutation({
        mutationKey: ["admin-exam-passages-update"],
        mutationFn: async ({ id, ...body }: UpdatePassageRequest) => {
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.exam.passages.admin.update.replace(":id", id),
                body,
                withCredentials: true,
            });
            return response as UpdatePassageResponse;
        },
    });
};
