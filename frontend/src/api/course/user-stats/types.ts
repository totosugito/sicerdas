import type { BaseResponse } from "@/api/types";

export interface SchemaGlobalStatsData {
  userId: string;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLecturesCompleted: number;
  totalWatchTimeMinutes: number;
  lastActiveAt: string | null;
}

export interface SchemaGlobalStatsResponse extends BaseResponse {
  data: SchemaGlobalStatsData;
}

export interface SchemaCategoryStatItem {
  categoryId: string;
  categoryName: string;
  coursesEnrolled: number;
  coursesCompleted: number;
}

export interface SchemaCategoryStatsResponse extends BaseResponse {
  data: SchemaCategoryStatItem[];
}
