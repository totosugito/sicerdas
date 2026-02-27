export interface EducationGrade {
    id: number;
    grade: string;
    name: string;
    desc: string | null;
    extra: any;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface EducationGradeResponse {
    success: boolean;
    message: string;
}

export interface EducationGradeDetailResponse extends EducationGradeResponse {
    data: EducationGrade;
}
