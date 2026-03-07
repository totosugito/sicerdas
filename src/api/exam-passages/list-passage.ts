import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamPassage } from "./types";
import { PaginationData } from "@/components/custom/table";

export interface ListPassageRequest {
    search?: string;
    subjectId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListPassagesResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamPassage[];
        meta: PaginationData;
    };
}

export const useListPassage = (params: ListPassageRequest) => {
    return useQuery({
        queryKey: ["admin-exam-passages-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.passages.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListPassagesResponse;
        },
    });
};
