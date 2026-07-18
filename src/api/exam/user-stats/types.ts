import type {
  GlobalStatsData,
  SubjectStatsData,
  TagStatsData,
  ActivityData,
  SubjectStatsParams,
} from "backend/src/modules/exam/user-stats/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  GlobalStatsData,
  SubjectStatsData,
  TagStatsData,
  ActivityData,
  SubjectStatsParams,
};

export interface GlobalStatsResponse extends BaseResponse {
  data: GlobalStatsData | null;
}

export interface SubjectStatsResponse extends BaseResponse {
  data: {
    items: SubjectStatsData[];
    meta: PaginationMeta;
  };
}

export interface TagStatsResponse extends BaseResponse {
  data: TagStatsData[];
}

export interface ActivityStatsResponse extends BaseResponse {
  data: ActivityData[];
}
