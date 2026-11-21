import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface SubjectData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectSimpleData {
  value: string;
  label: string;
}

export interface SubjectListParams {
  search?: string;
  isActive?: boolean;
  sortBy?: "name" | "createdAt" | "updatedAt" | "isActive";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CreateSubjectParams {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateSubjectParams {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

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
