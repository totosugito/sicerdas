import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamTag } from "../types";
import { PaginationData } from "@/components/custom/table";

export interface ListTagRequest {
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListTagResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamTag[];
        meta: PaginationData;
    };
}

export const useListTag = (params: ListTagRequest) => {
    return useQuery({
        queryKey: ["admin-exam-tags-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.tags.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListTagResponse;
        },
    });
};
