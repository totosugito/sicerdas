import type {
  QuestionTagItemT,
  AssignQuestionTagsParams,
  AssignQuestionTagsByNameParams,
  UnassignQuestionTagsParams,
  QuestionTagListParams,
} from "backend/src/modules/exam/question-tags/index.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  QuestionTagItemT as QuestionTag,
  AssignQuestionTagsParams as AssignQuestionTagsRequest,
  AssignQuestionTagsByNameParams as AssignQuestionTagsByNameRequest,
  UnassignQuestionTagsParams as UnassignQuestionTagsRequest,
  QuestionTagListParams as QuestionTagListRequest,
};

export interface QuestionTagListResponse extends BaseResponse {
  data: QuestionTagItemT[];
}
