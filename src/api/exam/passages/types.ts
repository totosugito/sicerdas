import type {
  PassageResponseItemT,
  CreatePassageParams,
  UpdatePassageParams,
  PassageListParams,
  PassageSimpleListParams,
} from "backend/src/modules/exam/passages/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  PassageResponseItemT,
  CreatePassageParams,
  UpdatePassageParams,
  PassageListParams,
  PassageSimpleListParams,
};

export type ExamPassage = PassageResponseItemT;

export interface PassageFormValues {
  title?: string;
  subjectId: string;
  content: Record<string, unknown>[];
  isActive?: boolean;
}

export interface PassageResponse<T> extends BaseResponse {
  data: T;
}

export interface ListPassagesResponse extends PassageResponse<{
  items: PassageResponseItemT[];
  meta: PaginationMeta;
}> {}

export interface ListPassagesSimpleResponse extends PassageResponse<{
  items: { value: string; label: string }[];
  meta: PaginationMeta;
}> {}

export interface PassageDetailResponse extends PassageResponse<PassageResponseItemT> {}
