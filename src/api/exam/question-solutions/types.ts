import type {
  QuestionSolutionResponseItemT,
  CreateQuestionSolutionParams,
  UpdateQuestionSolutionParams,
  QuestionSolutionListParams,
} from "backend/src/modules/exam/question-solutions/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  QuestionSolutionResponseItemT,
  CreateQuestionSolutionParams,
  UpdateQuestionSolutionParams,
  QuestionSolutionListParams,
};

export interface QuestionSolutionResponse<T> extends BaseResponse {
  data: T;
}

export interface ListQuestionSolutionsResponse extends QuestionSolutionResponse<{
  items: QuestionSolutionResponseItemT[];
  meta: PaginationMeta;
}> {}

export interface QuestionSolutionDetailResponse extends QuestionSolutionResponse<QuestionSolutionResponseItemT> {}
