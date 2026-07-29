import type {
  LectureTextItem,
  AdminCreateLectureTextInput,
  AdminUpdateLectureTextInput,
  LectureTextListQueryInput,
} from "backend/src/modules/course/lecture-texts/lecture-texts.schema.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type {
  LectureTextItem,
  AdminCreateLectureTextInput,
  AdminUpdateLectureTextInput,
  LectureTextListQueryInput,
};

export interface CourseLectureTextApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type PaginatedLectureTextListResponse = CourseLectureTextApiResponse<{
  items: LectureTextItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;

export type LectureTextDetailResponse = CourseLectureTextApiResponse<LectureTextItem>;
export type CreateLectureTextResponse = CourseLectureTextApiResponse<LectureTextItem>;
export type UpdateLectureTextResponse = CourseLectureTextApiResponse<LectureTextItem>;
export type DeleteLectureTextResponse = BaseResponse;
