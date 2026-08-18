import type {
  SubjectData,
  SubjectSimpleData,
  SubjectListParams,
  CreateSubjectParams,
  UpdateSubjectParams,
} from "backend/src/modules/exam/subjects/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  SubjectData,
  SubjectSimpleData,
  SubjectListParams,
  CreateSubjectParams,
  UpdateSubjectParams,
};

export interface SubjectListResponse extends BaseResponse {
  data: {
    items: SubjectData[];
    meta: PaginationMeta;
  };
}

export interface SubjectSimpleResponse extends BaseResponse {
  data: {
    items: SubjectSimpleData[];
    meta: PaginationMeta;
  };
}

export interface SubjectResponse extends BaseResponse {
  data: SubjectData;
}
