import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamSubjectDetailResponse } from "../types";

export interface UpdateSubjectRequest {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
}

export const useUpdateSubject = () => {
    return useMutation({
        mutationFn: async (data: UpdateSubjectRequest) => {
            const { id, ...body } = data;
            const response = await fetchApi({
                method: "PATCH",
                url: AppApi.exam.subjects.admin.update.replace(":id", id),
                body,
                withCredentials: true,
            });
            return response as ExamSubjectDetailResponse;
        },
    });
};
