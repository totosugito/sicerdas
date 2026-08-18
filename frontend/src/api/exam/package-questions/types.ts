import type {
  PackageQuestionItemT,
  PackageQuestionListParams,
  AssignPackageQuestionsParams,
  UnassignPackageQuestionsParams,
  SyncPackageQuestionsOrderParams,
  AssignResult,
} from "backend/src/modules/exam/package-questions/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  PackageQuestionItemT,
  PackageQuestionListParams,
  AssignPackageQuestionsParams,
  UnassignPackageQuestionsParams,
  SyncPackageQuestionsOrderParams,
  AssignResult,
  BaseResponse,
  PaginationMeta,
};

export interface QuestionResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type CommonResponse = BaseResponse;

export type ListPackageQuestionsResponse = QuestionResponse<{
  items: PackageQuestionItemT[];
  meta: PaginationMeta;
}>;

export type AssignPackageQuestionsResponse = QuestionResponse<AssignResult | undefined>;

export type ListPackageQuestionsRequest = PackageQuestionListParams;
export type AssignPackageQuestionsRequest = AssignPackageQuestionsParams;
export type UnassignPackageQuestionsRequest = UnassignPackageQuestionsParams;
export type SyncPackageQuestionsOrderRequest = SyncPackageQuestionsOrderParams;
