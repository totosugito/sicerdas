import type { BaseResponse, PaginationMeta } from "@/api/types";

export type { BaseResponse, PaginationMeta };

export interface PackageQuestionItemT {
  packageId: string;
  sectionId: string;
  questionId: string;
  order: number;
  question: {
    id: string;
    content: Record<string, unknown>[];
    type: string;
    difficulty: string;
    subjectName: string | null;
  };
  section?: {
    id: string;
    title: string;
  };
}

export interface PackageQuestionListParams {
  packageId: string;
  sectionId?: string;
  page?: number;
  limit?: number;
}

export interface AssignPackageQuestionsParams {
  packageId: string;
  sectionId: string;
  questionIds: string[];
}

export interface UnassignPackageQuestionsParams {
  packageId: string;
  questionIds: string[];
}

export interface SyncPackageQuestionsOrderParams {
  packageId: string;
  sectionId: string;
  updates: { questionId: string; order: number }[];
}

export interface AssignResult {
  totalAssigned: number;
  totalSkipped: number;
}

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
