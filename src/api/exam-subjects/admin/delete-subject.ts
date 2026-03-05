import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamSubjectResponse } from "../types";

export const useDeleteSubject = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.subjects.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamSubjectResponse;
        },
    });
};
