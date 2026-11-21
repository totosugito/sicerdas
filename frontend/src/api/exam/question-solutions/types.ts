import type { BaseResponse, PaginationMeta } from "@/api/types";
import type { SolutionType } from "@/api/exam/questions/types";

export interface QuestionSolutionResponseItemT {
  id: string;
  questionId: string;
  title: string;
  content: Record<string, unknown>[];
  solutionType: SolutionType;
  order: number;
  requiredTier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionSolutionParams {
  questionId: string;
  title: string;
  content: Record<string, unknown>[];
  solutionType?: SolutionType;
  order?: number;
  requiredTier?: string | null;
}

export interface UpdateQuestionSolutionParams {
  title?: string;
  content?: Record<string, unknown>[];
  solutionType?: SolutionType;
  order?: number;
  requiredTier?: string | null;
}

export interface QuestionSolutionListParams {
  questionId: string;
  page?: number;
  limit?: number;
}

export interface QuestionSolutionResponse<T> extends BaseResponse {
  data: T;
}

export interface ListQuestionSolutionsResponse
  extends QuestionSolutionResponse<{
    items: QuestionSolutionResponseItemT[];
    meta: PaginationMeta;
  }> {}

export interface QuestionSolutionDetailResponse
  extends QuestionSolutionResponse<QuestionSolutionResponseItemT> {}
