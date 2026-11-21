import type { BaseResponse } from "@/api/types";
import type { EnumLectureType } from "@/api/course/types";

export interface LectureItem {
  id: string;
  title: string | null;
  description: string | null;
  chapterId: string;
  createdByUserId: string | null;
  type: EnumLectureType;
  referenceUrl: string | null;
  extra: any;
  isActive: boolean;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateLectureInput {
  chapterId: string;
  title: string;
  description?: string;
  type?: EnumLectureType;
  referenceUrl?: string;
  extra?: any;
  position?: string;
  isActive?: boolean;
}

export interface AdminUpdateLectureInput {
  title?: string;
  description?: string;
  type?: EnumLectureType;
  referenceUrl?: string;
  extra?: any;
  position?: string;
  isActive?: boolean;
}

export interface CourseLectureApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type LectureListResponse = CourseLectureApiResponse<LectureItem[]>;
export type LectureDetailResponse = CourseLectureApiResponse<LectureItem>;
export type CreateLectureResponse = CourseLectureApiResponse<LectureItem>;
export type UpdateLectureResponse = CourseLectureApiResponse<LectureItem>;

export interface CreateLectureRequest extends AdminCreateLectureInput {}

export interface UpdateLectureRequest extends AdminUpdateLectureInput {
  id: string;
}
