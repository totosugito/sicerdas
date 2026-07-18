import type {
  CreateReportParams,
  CreateReportData,
} from "backend/src/modules/content-report/index.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  CreateReportParams,
  CreateReportData,
};

export interface CreateReportResponse extends BaseResponse {
  data: CreateReportData;
}
