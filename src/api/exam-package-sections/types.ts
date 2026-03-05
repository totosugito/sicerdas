export interface ExamPackageSection {
    id: string;
    packageId: string;
    packageName: string | null;
    title: string;
    durationMinutes: number | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    totalQuestions: number;
}

export interface ExamPackageSectionResponse {
    success: boolean;
    message: string;
}

export interface ExamPackageSectionDetailResponse extends ExamPackageSectionResponse {
    data: ExamPackageSection;
}
