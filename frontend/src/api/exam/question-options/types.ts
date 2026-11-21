import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface QuestionOptionResponseItemT {
  id: string;
  questionId: string;
  content: Record<string, unknown>[];
  isCorrect: boolean;
  score: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionOptionParams {
  questionId: string;
  content: Record<string, unknown>[];
  isCorrect?: boolean;
  score?: number;
  order?: number;
}

export interface UpdateQuestionOptionParams {
  content?: Record<string, unknown>[];
  isCorrect?: boolean;
  score?: number;
  order?: number;
}

export interface QuestionOptionListParams {
  questionId: string;
  page?: number;
  limit?: number;
}

export interface QuestionOptionResponse<T> extends BaseResponse {
  data: T;
}

export interface ListQuestionOptionsResponse
  extends QuestionOptionResponse<{
    items: QuestionOptionResponseItemT[];
    meta: PaginationMeta;
  }> {}

export interface QuestionOptionDetailResponse
  extends QuestionOptionResponse<QuestionOptionResponseItemT> {}
