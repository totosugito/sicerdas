import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface PassageResponseItemT {
  id: string;
  title: string | null;
  content: Record<string, unknown>[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subjectId: string;
  totalQuestions: number;
  activeQuestions: number;
  subjectName: string;
}

export interface CreatePassageParams {
  subjectId: string;
  title?: string | null;
  content: Record<string, unknown>[];
  isActive?: boolean;
}

export interface UpdatePassageParams {
  subjectId?: string;
  title?: string | null;
  content?: Record<string, unknown>[];
  isActive?: boolean;
}

export interface PassageListParams {
  search?: string;
  subjectId?: string;
  isActive?: boolean;
  sortBy?: "title" | "createdAt" | "updatedAt" | "isActive" | "totalQuestions";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PassageSimpleListParams {
  search?: string;
  subjectId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export type ExamPassage = PassageResponseItemT;

export interface PassageFormValues {
  title?: string;
  subjectId: string;
  content: Record<string, unknown>[];
  isActive?: boolean;
}

export interface PassageResponse<T> extends BaseResponse {
  data: T;
}

export interface ListPassagesResponse
  extends PassageResponse<{
    items: PassageResponseItemT[];
    meta: PaginationMeta;
  }> {}

export interface ListPassagesSimpleResponse
  extends PassageResponse<{
    items: { value: string; label: string }[];
    meta: PaginationMeta;
  }> {}

export interface PassageDetailResponse extends PassageResponse<PassageResponseItemT> {}
