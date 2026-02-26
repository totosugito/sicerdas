import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamCategory } from "../types";
import { PaginationData } from "@/components/custom/table";

export interface ListCategoryRequest {
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListCategoryResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamCategory[];
        meta: PaginationData;
    };
}

export const useListCategory = (params: ListCategoryRequest) => {
    return useQuery({
        queryKey: ["admin-exam-categories-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.categories.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListCategoryResponse;
        },
    });
};
