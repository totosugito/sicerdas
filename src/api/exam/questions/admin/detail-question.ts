import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamQuestionDetailResponse } from "../types";

export const useDetailQuestion = (id: string | undefined) => {
    return useQuery({
        queryKey: ["admin-exam-question-detail", id],
        queryFn: async () => {
            if (!id) return null;
            const response = await fetchApi({
                method: "GET",
                url: AppApi.exam.questions.admin.detail.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamQuestionDetailResponse;
        },
        enabled: !!id,
    });
};
