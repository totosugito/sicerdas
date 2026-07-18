import type {
  CategoryData,
  CategorySimpleData,
  CategoryListParams,
  CreateCategoryParams,
  UpdateCategoryParams,
} from "backend/src/modules/education/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  CategoryData,
  CategorySimpleData,
  CategoryListParams,
  CreateCategoryParams,
  UpdateCategoryParams,
};

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
