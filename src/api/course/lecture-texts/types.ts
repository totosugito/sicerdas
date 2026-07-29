import type {
  LectureTextItem,
  AdminCreateLectureTextInput,
  AdminUpdateLectureTextInput,
  LectureTextListQueryInput,
  LectureTextSimpleQueryInput,
  SimpleLectureTextItem,
} from "backend/src/modules/course/lecture-texts/lecture-texts.schema.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  LectureTextItem,
  AdminCreateLectureTextInput,
  AdminUpdateLectureTextInput,
  LectureTextListQueryInput,
  LectureTextSimpleQueryInput,
  SimpleLectureTextItem,
};

export interface CourseLectureTextApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type PaginatedLectureTextListResponse = CourseLectureTextApiResponse<{
  items: LectureTextItem[];
  meta: PaginationMeta;
}>;

export type PaginatedLectureTextSimpleResponse = CourseLectureTextApiResponse<{
  items: SimpleLectureTextItem[];
  meta: PaginationMeta;
}>;

export type LectureTextDetailResponse = CourseLectureTextApiResponse<LectureTextItem>;
export type CreateLectureTextResponse = CourseLectureTextApiResponse<LectureTextItem>;
export type UpdateLectureTextResponse = CourseLectureTextApiResponse<LectureTextItem>;
export type DeleteLectureTextResponse = BaseResponse;
