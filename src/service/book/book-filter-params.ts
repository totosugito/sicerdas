import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

// Types for filter parameters
export interface FilterParamGroup {
    id: number;
    name: string;
    desc?: string;
    status: string;
    stats: {
        bookTotal: number;
    };
}

export interface FilterParamCategory {
    id: number;
    code: string;
    name: string;
    desc?: string;
    status: string;
    groups: FilterParamGroup[];
}

export interface FilterParamsResponse {
    success: boolean;
    data: FilterParamCategory[];
}

export const useBookFilterParams = () => {
    return useQuery<FilterParamsResponse>({
        queryKey: ['book-filter-params'],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: `${AppApi.book.filterParams}`,
                withCredentials: true
            });
            return response;
        },
    });
}
