import type {
  ChapterProgressItem,
  CompleteLectureData,
  LectureProgressItem,
  SyllabusData,
  WatchTimeData,
} from "backend/src/modules/course/user-progress/user-progress.schema.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  ChapterProgressItem,
  CompleteLectureData,
  LectureProgressItem,
  SyllabusData,
  WatchTimeData,
};

export interface SyllabusResponse extends BaseResponse {
  data: SyllabusData;
}

export interface ProgressResponse extends BaseResponse {
  data: CompleteLectureData;
}

export interface WatchTimeResponse extends BaseResponse {
  data: WatchTimeData;
}
