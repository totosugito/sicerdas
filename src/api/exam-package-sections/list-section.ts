import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamPackageSection } from "./types";
import { PaginationData } from "@/components/custom/table";

export interface ListSectionRequest {
    packageId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListSectionsResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamPackageSection[];
        meta: PaginationData;
    };
}

export const useListPackageSection = (params: ListSectionRequest) => {
    return useQuery({
        queryKey: ["exam-package-sections-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.packageSections.list,
                body: params,
                withCredentials: true,
            });
            return response as ListSectionsResponse;
        },
    });
};
