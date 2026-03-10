import { EnumDifficultyLevel, EnumQuestionType } from 'backend/src/db/schema/exam/enums';

export { EnumDifficultyLevel, EnumQuestionType };

export type DifficultyLevel = typeof EnumDifficultyLevel[keyof typeof EnumDifficultyLevel];
export type QuestionType = typeof EnumQuestionType[keyof typeof EnumQuestionType];

export interface ExamQuestion {
    id: string;
    subjectId: string;
    subjectName?: string;
    passageId: string | null;
    passageTitle?: string | null;
    content: Record<string, unknown>[];
    difficulty: DifficultyLevel;
    type: QuestionType;
    requiredTier: string | null;
    educationGradeId: number | null;
    educationGradeName?: string;
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
