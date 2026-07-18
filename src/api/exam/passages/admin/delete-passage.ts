import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

interface DeletePassageResponse {
    success: boolean;
    message: string;
}

export const useDeletePassage = () => {
    return useMutation({
        mutationKey: ["admin-exam-passages-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.passages.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as DeletePassageResponse;
        },
    });
};
