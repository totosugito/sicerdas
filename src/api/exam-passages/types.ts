export interface ExamPassage {
    id: string;
    title: string | null;
    content: Record<string, unknown>[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    subjectId: string;
    subjectName: string;
    totalQuestions?: number;
}

export interface ExamPassageResponse {
    success: boolean;
    message: string;
}

export interface ExamPassageDetailResponse extends ExamPassageResponse {
    data: ExamPassage;
}
