export interface AppVersion {
  id: number;
  appVersion: number;
  dbVersion: number;
  dataType: string;
  status: string;
  name: string;
  note: Record<string, unknown>[];
  extra: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AppVersionResponse {
  success: boolean;
  message: string;
}

export interface AppVersionDetailResponse extends AppVersionResponse {
  data: AppVersion;
}

export interface ListVersionResponse extends AppVersionResponse {
  data: {
    items: AppVersion[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface VersionSimpleItem {
  id: number;
  name: string;
}

export interface ListVersionSimpleResponse extends AppVersionResponse {
  data: {
    items: VersionSimpleItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface CreateVersionRequest {
  appVersion: number;
  dbVersion: number;
  dataType: string;
  status?: string;
  name: string;
  note?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
}

export interface UpdateVersionRequest {
  appVersion?: number;
  dbVersion?: number;
  status?: string;
  name?: string;
  note?: Record<string, unknown>[];
  extra?: Record<string, unknown>;
}
