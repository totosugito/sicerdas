import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamTagResponse } from "../types";

export const useDeleteTag = () => {
    return useMutation({
        mutationKey: ["admin-exam-tags-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.tags.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamTagResponse;
        },
    });
};
