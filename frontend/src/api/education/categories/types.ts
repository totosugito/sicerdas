import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface CategoryData {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySimpleData {
  value: string;
  label: string;
  key: string;
}

export interface CategoryListParams {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CategorySimpleParams {
  page?: number;
  limit?: number;
}

export interface CreateCategoryParams {
  name: string;
  key?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryParams {
  name: string;
  key?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryListResponse extends BaseResponse {
  data: {
    items: CategoryData[];
    meta: PaginationMeta;
  };
}

export interface CategorySimpleResponse extends BaseResponse {
  data: {
    items: CategorySimpleData[];
    meta: PaginationMeta;
  };
}

export interface CategoryResponse extends BaseResponse {
  data: CategoryData;
}
