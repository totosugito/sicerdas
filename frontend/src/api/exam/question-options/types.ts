import type {
  QuestionOptionResponseItemT,
  CreateQuestionOptionParams,
  UpdateQuestionOptionParams,
  QuestionOptionListParams,
} from "backend/src/modules/exam/question-options/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  QuestionOptionResponseItemT,
  CreateQuestionOptionParams,
  UpdateQuestionOptionParams,
  QuestionOptionListParams,
};

export interface QuestionOptionResponse<T> extends BaseResponse {
  data: T;
}

export interface ListQuestionOptionsResponse extends QuestionOptionResponse<{
  items: QuestionOptionResponseItemT[];
  meta: PaginationMeta;
}> {}

export interface QuestionOptionDetailResponse extends QuestionOptionResponse<QuestionOptionResponseItemT> {}
