export interface AssignPackageQuestionsRequest {
    packageId: string;
    sectionId: string;
    questions: {
        questionId: string;
        order: number;
    }[];
}

export interface CommonResponse {
    success: boolean;
    message: string;
}
