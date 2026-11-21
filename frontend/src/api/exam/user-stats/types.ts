import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface GlobalStatsData {
  userId: string;
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  averageScore: string;
  accuracyRate: string;
  lastActiveAt: string | null;
  updatedAt: string;
}

export interface SubjectStatsData {
  id: string;
  subjectId: string;
  subjectName: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: string;
  updatedAt: string;
}

export interface TagStatsData {
  id: string;
  tagId: string;
  tagName: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: string;
  updatedAt: string;
}

export interface ActivityData {
  date: string;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  totalSessions: number;
}

export interface SubjectStatsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface TagStatsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

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
  data: {
    items: TagStatsData[];
    meta: PaginationMeta;
  };
}

export interface ActivityStatsResponse extends BaseResponse {
  data: ActivityData[];
}
