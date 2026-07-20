import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { PassageSimpleListParams, ListPassagesSimpleResponse } from "../types";

export const useListPassageSimple = (params: PassageSimpleListParams) => {
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
            return response as ListPassagesSimpleResponse;
        },
    });
};
