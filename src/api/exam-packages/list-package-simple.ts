import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export interface PackageSimpleItem {
    value: string;
    label: string;
}

export interface ListPackagesSimpleResponse {
    success: boolean;
    message: string;
    data: {
        items: PackageSimpleItem[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }
    };
}

export interface ListPackageSimpleRequest {
    page?: number;
    limit?: number;
}

export const useListPackageSimple = (params: ListPackageSimpleRequest = {}) => {
    return useQuery({
        queryKey: ["exam-packages-list-simple", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.packages.listSimple,
                body: params,
                withCredentials: true,
            });
            return response as ListPackagesSimpleResponse;
        },
    });
};
