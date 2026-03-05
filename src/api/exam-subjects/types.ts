export interface ExamSubject {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ExamSubjectResponse {
    success: boolean;
    message: string;
}

export interface ExamSubjectDetailResponse extends ExamSubjectResponse {
    data: ExamSubject;
}
