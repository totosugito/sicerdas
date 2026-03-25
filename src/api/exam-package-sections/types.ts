export interface ExamPackageSection {
  id: string;
  packageId: string;
  packageName: string | null;
  title: string;
  durationMinutes: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalQuestions: number;
}

export interface SectionQuestionItem {
  id: string;
  content: any[];
  type: string;
  difficulty: string;
  subjectName: string | null;
  order: number;
}

import { PaginationData } from "@/components/custom/table";

export interface SectionDetailItem extends Omit<ExamPackageSection, "totalQuestions"> {}

export interface ExamPackageSectionResponse {
  success: boolean;
  message: string;
}

export interface ExamPackageSectionDetailResponse extends ExamPackageSectionResponse {
  data: SectionDetailItem;
}
