import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamQuestion, DifficultyLevel, QuestionType } from "../types";
import { PaginationData } from "@/components/custom/table";

export interface ListQuestionRequest {
    search?: string;
    subjectId?: string;
    difficulty?: DifficultyLevel;
    type?: QuestionType;
    requiredTier?: string;
    educationGradeId?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ListQuestionsResponse {
    success: boolean;
    message: string;
    data: {
        items: ExamQuestion[];
        meta: PaginationData;
    };
}

export const useListQuestion = (params: ListQuestionRequest) => {
    return useQuery({
        queryKey: ["admin-exam-questions-list", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questions.admin.list,
                body: params,
                withCredentials: true,
            });
            return response as ListQuestionsResponse;
        },
    });
};
