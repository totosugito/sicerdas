import type { BaseResponse } from "@/api/types";

export interface QuestionTag {
  id: string;
  name: string;
  description?: string | null;
}

export interface AssignQuestionTagsRequest {
  questionId: string;
  tagIds: string[];
}

export interface AssignQuestionTagsByNameRequest {
  questionId: string;
  tags: string[];
}

export interface UnassignQuestionTagsRequest {
  questionId: string;
  tagIds: string[];
}

export interface QuestionTagListRequest {
  questionId?: string;
  tagId?: string;
}

export interface QuestionTagListResponse extends BaseResponse {
  data: QuestionTag[];
}
