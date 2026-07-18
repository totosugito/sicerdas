import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

interface DeleteQuestionResponse {
    success: boolean;
    message: string;
}

export const useDeleteQuestion = () => {
    return useMutation({
        mutationKey: ["admin-exam-questions-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.questions.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as DeleteQuestionResponse;
        },
    });
};
