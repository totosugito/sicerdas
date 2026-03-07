import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export interface SubjectSimpleItem {
    value: string;
    label: string;
}

export interface ListSubjectsSimpleResponse {
    success: boolean;
    message: string;
    data: {
        items: SubjectSimpleItem[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }
    };
}

export interface ListSubjectSimpleRequest {
    search?: string;
    page?: number;
    limit?: number;
}

export const useListSubjectSimple = (params: ListSubjectSimpleRequest = {}) => {
    return useQuery({
        queryKey: ["exam-subjects-list-simple", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.subjects.listSimple,
                body: params,
                withCredentials: true,
            });
            return response as ListSubjectsSimpleResponse;
        },
    });
};
