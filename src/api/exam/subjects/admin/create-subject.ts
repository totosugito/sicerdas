import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamSubjectDetailResponse } from "../types";

export interface CreateSubjectRequest {
    name: string;
    description?: string;
    isActive?: boolean;
}

export const useCreateSubject = () => {
    return useMutation({
        mutationFn: async (body: CreateSubjectRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.subjects.admin.create,
                body,
                withCredentials: true,
            });
            return response as ExamSubjectDetailResponse;
        },
    });
};
