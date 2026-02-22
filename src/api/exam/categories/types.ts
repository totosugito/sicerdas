export interface ExamCategory {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExamCategoryResponse {
    success: boolean;
    message: string;
}

export interface ExamCategoryDetailResponse extends ExamCategoryResponse {
    data: ExamCategory;
}
