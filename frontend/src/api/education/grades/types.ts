import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface GradeData {
  id: number;
  grade: string;
  name: string;
  desc: string | null;
  extra: unknown;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GradeSimpleData {
  value: string;
  label: string;
}

export interface GradeListParams {
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface GradeSimpleParams {
  page?: number;
  limit?: number;
  isDefault?: boolean;
}

export interface CreateGradeParams {
  grade: string;
  name: string;
  desc?: string;
  extra?: unknown;
  isDefault?: boolean;
}

export interface UpdateGradeParams {
  name?: string;
  desc?: string;
  extra?: unknown;
  isDefault?: boolean;
}

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
