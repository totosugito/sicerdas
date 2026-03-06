import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export interface GradeSimpleItem {
    value: string;
    label: string;
}

export interface ListGradesSimpleResponse {
    success: boolean;
    message: string;
    data: {
        items: GradeSimpleItem[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }
    };
}

export interface ListGradeSimpleRequest {
    page?: number;
    limit?: number;
}

export const useListGradeSimple = (params: ListGradeSimpleRequest = {}) => {
    return useQuery({
        queryKey: ["education-grades-list-simple", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.education.grade.listSimple,
                body: params,
                withCredentials: true,
            });
            return response as ListGradesSimpleResponse;
        },
    });
};
