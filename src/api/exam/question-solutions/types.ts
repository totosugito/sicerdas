export interface ExamQuestionSolution {
    id: string;
    questionId: string;
    title: string;
    content: Record<string, unknown>[];
    solutionType: string;
    order: number;
    requiredTier: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ExamQuestionSolutionResponse {
    success: boolean;
    message: string;
}

export interface ExamQuestionSolutionDetailResponse extends ExamQuestionSolutionResponse {
    data: ExamQuestionSolution;
}

export interface ListQuestionSolutionsResponse extends ExamQuestionSolutionResponse {
    data: {
        items: ExamQuestionSolution[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface QuestionSolutionFormValues {
    questionId: string;
    title: string;
    content: Record<string, unknown>[];
    solutionType?: string;
    order?: number;
    requiredTier?: string | null;
}
