import type {
  GradeData,
  GradeSimpleData,
  GradeListParams,
  CreateGradeParams,
  UpdateGradeParams,
} from "backend/src/modules/education/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  GradeData,
  GradeSimpleData,
  GradeListParams,
  CreateGradeParams,
  UpdateGradeParams,
};

export interface GradeListResponse extends BaseResponse {
  data: {
    items: GradeData[];
    meta: PaginationMeta;
  };
}

export interface GradeSimpleResponse extends BaseResponse {
  data: {
    items: GradeSimpleData[];
    meta: PaginationMeta;
  };
}

export interface GradeResponse extends BaseResponse {
  data: GradeData;
}
