import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamSubject } from "./types";
import { PaginationData } from "@/components/custom/table";

export interface ListSubjectRequest {
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListSubjectResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamSubject[];
        meta: PaginationData;
    };
}

export const useListSubject = (params: ListSubjectRequest) => {
    return useQuery({
        queryKey: ["exam-subjects-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.subjects.list,
                body: params,
                withCredentials: true,
            });
            return response as ListSubjectResponse;
        },
    });
};
