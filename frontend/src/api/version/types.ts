import type {
  BaseResponse,
  EnumContentStatus,
  EnumContentType,
  PaginationMeta,
} from "@/api/types";

export interface AppVersion {
  id: number;
  appVersion: number;
  dbVersion: number;
  dataType: EnumContentType;
  status: EnumContentStatus;
  name: string;
  note: Record<string, unknown>[];
  extra: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VersionSimpleItem {
  id: number;
  name: string;
  published: boolean;
}

export interface CreateVersionRequest {
  appVersion: number;
  dbVersion: number;
  dataType: EnumContentType;
  status?: EnumContentStatus;
  name: string;
  note?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
}

export interface UpdateVersionRequest {
  appVersion?: number;
  dbVersion?: number;
  status?: EnumContentStatus;
  name?: string;
  note?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
}

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
