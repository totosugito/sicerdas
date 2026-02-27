import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { EducationGrade } from "./types";
import { PaginationData } from "@/components/custom/table";

export interface ListEducationGradeRequest {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListEducationGradeResponse {
    success: boolean;
    message: string;
    data: {
        items: EducationGrade[];
        meta: PaginationData;
    };
}

export const useListEducationGrade = (params: ListEducationGradeRequest) => {
    return useQuery({
        queryKey: ["education-grade-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.educationGrade.list,
                body: params,
                withCredentials: true,
            });
            return response as ListEducationGradeResponse;
        },
    });
};
