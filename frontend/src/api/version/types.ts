import type {
  AppVersion,
  VersionSimpleItem,
  CreateVersionRequest,
  UpdateVersionRequest,
} from "backend/src/modules/version/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  AppVersion,
  VersionSimpleItem,
  CreateVersionRequest,
  UpdateVersionRequest,
};



export interface VersionResponse<T = AppVersion> extends BaseResponse {
  data: T;
}



export interface ListVersionResponse extends BaseResponse {
  data: {
    items: AppVersion[];
    meta: PaginationMeta;
  };
}

export interface ListVersionSimpleResponse extends BaseResponse {
  data: {
    items: VersionSimpleItem[];
    meta: PaginationMeta;
  };
}
