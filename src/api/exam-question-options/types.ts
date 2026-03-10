export interface ExamQuestionOption {
    id: string;
    questionId: string;
    content: Record<string, unknown>[];
    isCorrect: boolean;
    order: number;
}

export interface ExamQuestionOptionResponse {
    success: boolean;
    message: string;
}

export interface ExamQuestionOptionDetailResponse extends ExamQuestionOptionResponse {
    data: ExamQuestionOption;
}

export interface ListQuestionOptionsResponse extends ExamQuestionOptionResponse {
    data: {
        items: ExamQuestionOption[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface QuestionOptionFormValues {
    questionId: string;
    content: Record<string, unknown>[];
    isCorrect?: boolean;
    order?: number;
}
