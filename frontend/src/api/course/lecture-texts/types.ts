import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface LectureTextItem {
  id: string;
  title: string | null;
  content: Record<string, any>[];
  categoryId: string | null;
  educationGradeId: number | null;
  status: string;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    key: string;
  } | null;
  grade?: {
    id: number;
    name: string;
    grade: string;
  } | null;
}

export interface SimpleLectureTextItem {
  value: string;
  label: string;
}

export interface AdminCreateLectureTextInput {
  title?: string;
  content: Record<string, any>[];
  categoryId?: string | null;
  educationGradeId?: number | null;
  status?: string;
}

export interface AdminUpdateLectureTextInput {
  title?: string;
  content?: Record<string, any>[];
  categoryId?: string | null;
  educationGradeId?: number | null;
  status?: string;
}

export interface LectureTextListQueryInput {
  search?: string;
  categoryId?: string;
  educationGradeId?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface LectureTextSimpleQueryInput {
  search?: string;
  categoryId?: string;
  educationGradeId?: number;
  status?: string;
  page?: number;
  limit?: number;
}

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
