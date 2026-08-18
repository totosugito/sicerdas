import type {
  TagData,
  TagSimpleData,
  TagListParams,
  CreateTagParams,
  UpdateTagParams,
} from "backend/src/modules/education/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  TagData,
  TagSimpleData,
  TagListParams,
  CreateTagParams,
  UpdateTagParams,
};

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
