export interface ExamTag {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    totalQuestions: number;
    createdAt: string;
    updatedAt: string;
}

export interface ExamTagDetailData {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExamTagResponse {
    success: boolean;
    message: string;
}

export interface ExamTagDetailResponse extends ExamTagResponse {
    data: ExamTagDetailData;
}
