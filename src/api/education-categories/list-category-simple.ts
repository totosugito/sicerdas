import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export interface CategorySimpleItem {
    value: string;
    label: string;
}

export interface ListCategoriesSimpleResponse {
    success: boolean;
    message: string;
    data: {
        items: CategorySimpleItem[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }
    };
}

export interface ListCategorySimpleRequest {
    page?: number;
    limit?: number;
}

export const useListCategorySimple = (params: ListCategorySimpleRequest = {}) => {
    return useQuery({
        queryKey: ["education-categories-list-simple", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.education.categories.listSimple,
                body: params,
                withCredentials: true,
            });
            return response as ListCategoriesSimpleResponse;
        },
    });
};
