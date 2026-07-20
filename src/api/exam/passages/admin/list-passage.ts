import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { PassageListParams, ListPassagesResponse } from "../types";

export const useListPassage = (params: PassageListParams) => {
    return useQuery({
        queryKey: ["admin-exam-passages-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.passages.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListPassagesResponse;
        },
    });
};
