import type {
  ChapterItem,
  AdminCreateChapterInput,
  AdminUpdateChapterInput,
} from "backend/src/modules/course/chapters/chapters.schema.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type { ChapterItem, AdminCreateChapterInput, AdminUpdateChapterInput };

export interface CourseChapterApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type ChapterListResponse = CourseChapterApiResponse<ChapterItem[]>;

export type ChapterDetailResponse = CourseChapterApiResponse<ChapterItem>;
export type CreateChapterResponse = CourseChapterApiResponse<ChapterItem>;
export type UpdateChapterResponse = CourseChapterApiResponse<ChapterItem>;
export type DeleteChapterResponse = BaseResponse;

export interface CreateChapterRequest extends AdminCreateChapterInput {}

export interface UpdateChapterRequest extends AdminUpdateChapterInput {
  id: string;
}
