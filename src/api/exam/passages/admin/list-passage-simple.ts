import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { PaginationData } from "@/components/custom/table";

export interface ListPassageSimpleRequest {
    subjectId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ListPassageSimpleResponse {
    success: boolean;
    message: string;
    data: {
        items: { value: string; label: string }[];
        meta: PaginationData;
    };
}

export const useListPassageSimple = (params: ListPassageSimpleRequest) => {
    return useQuery({
        queryKey: ["admin-exam-passages-list-simple", params],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.passages.admin.listSimple,
                body: params,
                withCredentials: true,
            });
            return response as ListPassageSimpleResponse;
        },
    });
};
