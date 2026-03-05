import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamPackage } from "./types";
import { PaginationData } from "@/components/custom/table";

export interface ListPackageRequest {
    search?: string;
    categoryId?: string;
    examType?: string;
    isActive?: boolean;
    educationGradeId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListPackagesResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamPackage[];
        meta: PaginationData;
    };
}

export const useListPackage = (params: ListPackageRequest) => {
    return useQuery({
        queryKey: ["exam-packages-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.packages.list,
                body: params,
                withCredentials: true,
            });
            return response as ListPackagesResponse;
        },
    });
};
