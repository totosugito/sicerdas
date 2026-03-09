export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'essay';

export interface ExamQuestion {
    id: string;
    subjectId: string;
    passageId: string | null;
    content: Record<string, unknown>[];
    difficulty: DifficultyLevel;
    type: QuestionType;
    requiredTier: string | null;
    educationGradeId: number | null;
    isActive: boolean;
    totalOptions?: number;
    tags?: { id: string; name: string }[];
    createdAt: string;
    updatedAt: string;
}

export interface ExamQuestionResponse {
    success: boolean;
    message: string;
}

export interface ExamQuestionDetailResponse extends ExamQuestionResponse {
    data: ExamQuestion;
}

export type QuestionFormValues = {
    subjectId: string;
    passageId?: string | null;
    content: Record<string, unknown>[];
    difficulty: DifficultyLevel;
    type: QuestionType;
    requiredTier?: string | null;
    educationGradeId?: number | null;
    isActive: boolean;
};
