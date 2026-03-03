import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamSubjectDetailResponse } from "./types";

export const useDetailSubject = (id: string | undefined) => {
    return useQuery({
        queryKey: ["exam-subject-detail", id],
        queryFn: async () => {
            if (!id) return null;
            const response = await fetchApi({
                method: "GET",
                url: AppApi.exam.subjects.detail.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamSubjectDetailResponse;
        },
        enabled: !!id,
    });
};
