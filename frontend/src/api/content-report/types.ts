import type { BaseResponse, EnumContentType, EnumReportReason } from "@/api/types";

export interface CreateReportParams {
  name: string;
  email: string;
  title: string;
  contentType: EnumContentType;
  referenceId: string;
  reason: EnumReportReason;
  description?: string;
  extra?: Record<string, unknown>;
}

export interface CreateReportData {
  id: string;
}

export interface CreateReportResponse extends BaseResponse {
  data: CreateReportData;
}
