import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface TagData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagSimpleData {
  value: string;
  label: string;
}

export interface TagListParams {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateTagParams {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateTagParams = Partial<CreateTagParams>;

export interface TagListResponse extends BaseResponse {
  data: {
    items: TagData[];
    meta: PaginationMeta;
  };
}

export interface TagSimpleResponse extends BaseResponse {
  data: {
    items: TagSimpleData[];
    meta: PaginationMeta;
  };
}

export interface TagResponse extends BaseResponse {
  data: TagData;
}
