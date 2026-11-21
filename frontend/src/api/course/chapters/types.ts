import type { BaseResponse } from "@/api/types";

export interface ChapterItem {
  id: string;
  chapterName: string | null;
  courseId: string;
  createdByUserId: string | null;
  extra: any;
  isActive: boolean;
  position: string | null;
  createdAt: string;
  updatedAt: string;
  totalLectures?: number;
}

export interface AdminCreateChapterInput {
  courseId: string;
  chapterName: string;
  position?: string;
  isActive?: boolean;
}

export interface AdminUpdateChapterInput {
  chapterName?: string;
  position?: string;
  isActive?: boolean;
}

export interface CourseChapterApiResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type ChapterListResponse = CourseChapterApiResponse<ChapterItem[]>;
export type ChapterDetailResponse = CourseChapterApiResponse<ChapterItem>;
export type CreateChapterResponse = CourseChapterApiResponse<ChapterItem>;
export type UpdateChapterResponse = CourseChapterApiResponse<ChapterItem>;

export interface CreateChapterRequest extends AdminCreateChapterInput {}

export interface UpdateChapterRequest extends AdminUpdateChapterInput {
  id: string;
}
