import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamQuestion, DifficultyLevel, QuestionType } from "../types";

interface CreateQuestionResponse {
    success: boolean;
    message: string;
    data: ExamQuestion;
}

export interface CreateQuestionRequest {
    subjectId: string;
    passageId?: string | null;
    content: Record<string, unknown>[];
    difficulty: DifficultyLevel;
    type: QuestionType;
    requiredTier?: string | null;
    educationGradeId?: number | null;
    isActive?: boolean;
}

export const useCreateQuestion = () => {
    return useMutation({
        mutationKey: ["admin-exam-questions-create"],
        mutationFn: async (body: CreateQuestionRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.questions.admin.create,
                body,
                withCredentials: true,
            });
            return response as CreateQuestionResponse;
        },
    });
};
