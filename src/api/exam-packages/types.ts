export interface ExamPackage {
    id: string;
    categoryId: string;
    title: string;
    examType: string;
    durationMinutes: number;
    description: string | null;
    requiredTier: string | null;
    educationGradeId: number | null;
    categoryName: string | null;
    educationGradeName: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExamPackageResponse {
    success: boolean;
    message: string;
}

export interface ExamPackageDetailResponse extends ExamPackageResponse {
    data: ExamPackage;
}
