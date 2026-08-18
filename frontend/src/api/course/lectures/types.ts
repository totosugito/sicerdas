import type {
  LectureItem,
  AdminCreateLectureInput,
  AdminUpdateLectureInput,
} from "backend/src/modules/course/lectures/lectures.schema.ts";
import type { BaseResponse } from "backend/src/types/index.ts";

export type { LectureItem, AdminCreateLectureInput, AdminUpdateLectureInput };

export interface CourseLectureApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type LectureListResponse = CourseLectureApiResponse<LectureItem[]>;
export type LectureDetailResponse = CourseLectureApiResponse<LectureItem>;
export type CreateLectureResponse = CourseLectureApiResponse<LectureItem>;
export type UpdateLectureResponse = CourseLectureApiResponse<LectureItem>;
export type DeleteLectureResponse = BaseResponse;

export interface CreateLectureRequest extends AdminCreateLectureInput {}

export interface UpdateLectureRequest extends AdminUpdateLectureInput {
  id: string;
}
