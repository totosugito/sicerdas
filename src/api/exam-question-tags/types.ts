export interface QuestionTag {
    questionId: string;
    tagId: string;
    tag?: {
        id: string;
        name: string;
    };
}

export interface AssignQuestionTagsRequest {
    questionId: string;
    tagIds: string[];
}

export interface UnassignQuestionTagsRequest {
    questionId: string;
    tagIds: string[];
}

export interface QuestionTagListRequest {
    questionId?: string;
    tagId?: string;
}

export interface QuestionTagListResponse {
    success: boolean;
    message: string;
    data: QuestionTag[];
}

export interface CommonResponse {
    success: boolean;
    message: string;
}
