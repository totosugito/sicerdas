import type { BaseResponse } from "@/api/types";

export interface LectureProgressItem {
  id: string;
  title: string | null;
  description: string | null;
  chapterId: string;
  type: string;
  referenceUrl: string | null;
  extra: any;
  packageId: string | null;
  position: string;
  isCompleted: boolean;
  watchTimeSeconds: number;
  completedAt: string | null;
}

export interface ChapterProgressItem {
  id: string;
  chapterName: string | null;
  courseId: string;
  position: string;
  lectures: LectureProgressItem[];
}

export interface SyllabusData {
  courseId: string;
  totalLectures: number;
  completedLectures: number;
  progressPercentage: number;
  chapters: ChapterProgressItem[];
}

export interface CompleteLectureData {
  lectureId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt: string;
  score?: number | null;
  passed?: boolean;
}

export interface SyllabusResponse extends BaseResponse {
  data: SyllabusData;
}

export interface ProgressResponse extends BaseResponse {
  data: CompleteLectureData;
}
